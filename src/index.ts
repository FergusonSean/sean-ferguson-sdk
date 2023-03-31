import axios from 'axios';
import type {AxiosError} from 'axios';

type Filter = Record<string, { op: OPS, value?: { toString: () => string} | [{ toString: () => string}]}>;

interface RequestParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
}

interface FilterableRequestParams extends RequestParams {
  filters?: Filter;
}

export enum OPS {
  EXISTS = '',
  NOT_EXISTS = '!',
  GT = '>',
  GTE = '>=',
  LT = '<',
  LTE = '<=',
  MATCH = '=',
  NOT_MATCH = '!=',
}

export class Client {
  token: string;

  baseUrl: string;

  constructor({token, baseUrl = 'https://the-one-api.dev/v2' }: {token: string, baseUrl?: string }) {
    this.token = token;
    this.baseUrl = baseUrl

  }

  static generateQuery(params: FilterableRequestParams) {
    const {filters, ...paginationFields} = params;
    let query = Object.entries(paginationFields)
    .map(([k, v]: [string,string]) => `${k}=${v}`)
    .join('&')
    if(filters) {
      query += Object.entries(filters ).map(([field, filter]) => {
        switch(filter.op) {
          case OPS.EXISTS:
            case OPS.NOT_EXISTS:
            return `${filter.op}${field}`
          default:
            return `${field}${filter.op}${[filter.value].flat().join(',')}`
        }

      }).join('&')
    }

    return query;

  }

  async sendRequest(path: string, query = '') {
    for(let retries = 10; retries >= 0; retries -= 1) {
      console.log('trying', path, retries)
      try {
        const response = await axios.get<{docs: [Record<string, any>]}>(
          `${this.baseUrl}${path}${query ? `?${query}` : ''}`, 
            {
            headers: {
              'Authorization': `Bearer ${this.token}`
            }
          }
        )
        console.log(response.data)
        return response?.data?.docs
      } catch (e) {
        if((e as AxiosError)?.response?.status === 429) {
          await new Promise(res => {
            setTimeout(res, 2**(11 - retries) * 1000)
          })
          continue;
        }

        console.log(e.response.status)
        throw e
      } 
    }

    return [];

  }

  getMovie(movieId: string) {
    return this.sendRequest(`/movie/${movieId}`).then(movies => movies[0])
  }

  getMovieQuotes(movieId: string, params: RequestParams = {}) {
    return this.sendRequest(`/movie/${movieId}/quote`, Client.generateQuery(params))
  }

  async getMovies(params: FilterableRequestParams = {}) {
    const query = Client.generateQuery(params)

    return this.sendRequest('/movie', query)
  }
}
