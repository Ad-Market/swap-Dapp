import { gql } from "@apollo/client"

export const GET_TOKENS = gql`
    {
        token {
            address
            name
            symbol
            decimals
        }
    }
`

export const ADD_TOKEN = gql`
    mutation AddToken($address: String, $name: String, $symbol: String, $decimals: Int) {
        addToken(address: $address, name: $name, symbol: $symbol, decimals: $decimals) {
            symbol
            name
        }
    }
`

export const GET_TOKEN_BY_SYMBOL = gql`
    query GetTokenBySymbol($symbol: String) {
        getTokenBySymbol(symbol: $symbol) {
            symbol
            name
        }
    }
`
export const GET_TOKEN_BY_ADDRESS = gql`
    query GetTokenByAddress($address: String) {
        getTokenByAddress(address: $address) {
            symbol
            name
        }
    }
`
