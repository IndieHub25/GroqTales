import { AlchemyConfig } from '../api/alchemy-config';
import { GetTokenPriceByAddressResponse, GetTokenPriceBySymbolResponse, HistoricalPriceByAddressResponse, HistoricalPriceBySymbolResponse, HistoricalPriceInterval, TokenAddressRequest } from '../types/prices-types';
import { Network } from '../types/types';
export declare function getTokenPriceByAddress(config: AlchemyConfig, addresses: TokenAddressRequest[], srcMethod?: string): Promise<GetTokenPriceByAddressResponse>;
export declare function getTokenPriceBySymbol(config: AlchemyConfig, symbols: string[], srcMethod?: string): Promise<GetTokenPriceBySymbolResponse>;
export declare function getHistoricalPriceBySymbol(config: AlchemyConfig, symbol: string, startTime: string | number, endTime: string | number, interval: HistoricalPriceInterval, srcMethod?: string): Promise<HistoricalPriceBySymbolResponse>;
export declare function getHistoricalPriceByAddress(config: AlchemyConfig, network: Network, address: string, startTime: string | number, endTime: string | number, interval: HistoricalPriceInterval, srcMethod?: string): Promise<HistoricalPriceByAddressResponse>;
