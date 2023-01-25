import { useLazyQuery, useMutation } from "@apollo/client"
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { ADD_TOKEN, GET_TOKEN_BY_ADDRESS, GET_TOKEN_BY_SYMBOL } from "./graphqlQueries"
import ERC20ABI from "../constants/ERC20ABI.json"

export const AddToken = ({ web3Provider }) => {
    const [tokenName, setTokenName] = useState("")
    const [tokenSymbol, setTokenSymbol] = useState("")
    const [tokenAddress, setTokenAddress] = useState("")
    const [tokenDecimal, setTokenDecimal] = useState()

    const [AddToken, { data: AddTokenData, loading: AddTokenLoading, error: AddTokenError }] =
        useMutation(ADD_TOKEN)
    const [getTokenBySymbol] = useLazyQuery(GET_TOKEN_BY_SYMBOL)
    const [getTokenByAddress] = useLazyQuery(GET_TOKEN_BY_ADDRESS)

    const onSubmit = async () => {
        setTokenSymbol(undefined)
        setTokenDecimal(undefined)
        setTokenName(undefined)
        if (ethers.utils.isAddress(tokenAddress.toString())) {
            const data = await (
                await getTokenByAddress({ variables: { address: tokenAddress } })
            ).data.getTokenByAddress
            if (data) {
                throw `This is the address of the ${data.symbol} token, It exist!`
            } else {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, web3Provider)
                await tokenContract.symbol().then((result) => {
                    setTokenSymbol(result)
                })
                await tokenContract.name().then((result) => {
                    setTokenName(result)
                })
                await tokenContract.decimals().then((result) => {
                    setTokenDecimal(result)
                })
            }
        } else {
            throw "invalid token Address!"
        }
    }

    const AddFunction = async () => {
        console.log("sent")
        console.log(tokenName)
        console.log(tokenSymbol)
        console.log(tokenAddress)
        console.log(tokenDecimal)
        await AddToken({
            variables: {
                name: tokenName,
                address: tokenAddress,
                symbol: tokenSymbol,
                decimals: tokenDecimal,
            },
        }).then(() => {
            console.log("added")
        })
    }

    useEffect(() => {
        if (tokenDecimal && tokenName && tokenSymbol) {
            AddFunction()
        }
    }, [tokenDecimal, tokenName, tokenSymbol])

    return (
        <div className="h-fit bg-slate-500 w-[30rem] p-3">
            <h1 className="mb-2 font-bold text-blue-50 text-xl text-end font-mono">
                {" "}
                Import Token{" "}
            </h1>
            <input
                className="focus:shadow-3xl focus:shadow-blue-500 border-2 border-blue-500 outline-none bg-slate-500 rounded-lg w-full mb-2 placeholder:text-slate-100 p-1 text-slate-50"
                placeholder="Token Address"
                onChange={(e) => {
                    setTokenAddress(e.target.value)
                }}
            ></input>
            <button
                className="w-full shadow-md shadow-blue-900 hover:shadow-none bg-blue-500 text-white font-semibold text-md p-1 rounded-lg"
                onClick={() => {
                    onSubmit()
                }}
            >
                Import
            </button>
        </div>
    )
}
