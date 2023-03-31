import axios from 'axios';
import type {AxiosError} from 'axios';

type FilterEntries<KeyType extends (string | number | symbol) = string> = Record<KeyType, Filter>;

type Filter = VerboseFilter | AliasFilter;

type AliasFilter = boolean | VerboseFilter["value"];

type VerboseFilter = { 
  op: OPS, 
  value?: { toString: () => string} | [{ toString: () => string}]
};

interface RequestParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
}

interface FilterableRequestParams<FilterableFieldType extends (string | number | symbol) = string> extends RequestParams {
  filters?: FilterEntries<FilterableFieldType>;
}

interface Movie {
  _id: string;
  academyAwardNominations: number;
  academyAwardWins: number;
  boxOfficeRevenueInMillions: number;
  budgetInMillions: number;
  name: string;
  rottenTomatoesScore: string;
  runtimeInMinutes: string;
}

interface Quote {
  _id: string;
  dialog: string;
  movie: string;
  character: string;
  id: string;
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
        query += Object.entries(filters ).map(([field, rawFilter]) => {
          let filter: VerboseFilter;

          if(rawFilter === true) {
            filter = { op: OPS.EXISTS }
          } else if(rawFilter === false) {
            filter = { op: OPS.NOT_EXISTS }
          } else if((rawFilter as VerboseFilter)?.op) {
            filter = rawFilter as VerboseFilter
          } else {
            filter = { op: OPS.MATCH, value: rawFilter}
          }

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

    async sendRequest<ResponseType>(path: string, query = ''): Promise<[ResponseType]> {
      for(let retries = 10; retries >= 0; retries -= 1) {
        try {
          const response = await axios.get<{docs: [ResponseType]}>(
            `${this.baseUrl}${path}${query ? `?${query}` : ''}`, 
            {
              headers: {
                'Authorization': `Bearer ${this.token}`
              }
            }
          )
          console.log( response?.data?.docs)
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

      return [] as unknown as [ResponseType];

    }

    async getMovie(movieId: string): Promise<Movie> {
      const movies = await this.sendRequest<Movie>(`/movie/${movieId}`);
      return movies[0]
    }

    getMovieQuotes(movieId: string, params: RequestParams = {}): Promise<[Quote]> {
      return this.sendRequest<Quote>(`/movie/${movieId}/quote`, Client.generateQuery(params))
    }

    async getMovies(params: FilterableRequestParams<keyof Movie> = {}): Promise<[Movie]> {
      const query = Client.generateQuery(params)

      return this.sendRequest<Movie>('/movie', query)
    }
  }
