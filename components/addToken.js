import { ethers } from "ethers"
import { useState } from "react"
import ERC20ABI from "../constants/ERC20ABI.json"
import { Loading } from "@web3uikit/core"
import { ImCheckmark } from "react-icons/im"
import { ImCancelCircle } from "react-icons/im"
import tokenLists from "../Utils/tokenList.json"
const fleekStorage = require("@fleekhq/fleek-storage-js")

export const AddToken = ({ web3Provider, showAddTokenModal, setShowAddTokenModal }) => {
    const [tokenAddress, setTokenAddress] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState()
    const [tokenAdded, setTokenAdded] = useState(false)
    const API_SECRET = process.env.NEXT_PUBLIC_FLEEK_API_SECRET
    const API_KEY = process.env.NEXT_PUBLIC_FLEEK_API_KEY

    const editedTokenList = []
    const edit = new Promise((resolve) => {
        tokenLists.forEach((token) => {
            editedTokenList.push({
                address: token.address,
                name: token.name,
                symbol: token.symbol,
                decimals: token.decimals,
            })
        })
        if (editedTokenList.length == tokenLists.length) {
            resolve("Promise resolved successfully")
        }
    })
    const submit = async () => {
        if (ethers.utils.isAddress(tokenAddress.toString())) {
            setLoading(true)
            await checkIfTokenExist()
            setLoading(false)
        } else {
            setLoading(false)
            setError("invalid token Address!")
        }
    }

    if (!showAddTokenModal) {
        return null
    }
    const checkIfTokenExist = async () => {
        const enc = new TextDecoder("utf-8")
        setError(false)
        let myFile
        try {
            myFile = await fleekStorage.get({
                apiKey: API_KEY,
                apiSecret: API_SECRET,
                key: `tokenList`,
                getOptions: ["data"],
            })
        } catch (e) {
            console.log("error getting data")
            setError(false)
        }
        if (!myFile) {
            return
        }
        const data = JSON.parse(enc.decode(myFile.data))
        const datum = data.find((datum) => datum.address == tokenAddress.toString())
        if (!datum) {
            let symbol, name, decimals
            try {
                const tokenContract = new ethers.Contract(tokenAddress, ERC20ABI, web3Provider)
                name = await tokenContract.name()
                decimals = await tokenContract.decimals()
                symbol = await tokenContract.symbol()
            } catch (e) {
                setError("invalid token Address!")
                setLoading(false)
                console.log(e)
                return
            }
            const newToken = {
                address: tokenAddress,
                name: name,
                symbol: symbol,
                decimals: decimals,
            }
            data.push(newToken)
            try {
                await fleekStorage
                    .upload({
                        apiKey: API_KEY,
                        apiSecret: API_SECRET,
                        key: `tokenList`,
                        data: JSON.stringify(data),
                    })
                    .then(() => {
                        setTokenAdded("Successful")
                        window.location.reload()
                    })
            } catch (e) {
                setTokenAdded("Failed")
            }
        } else {
            setError(`this is the address of the ${datum.name} token, it exist!`)
        }
    }
    const handle = (e) => {
        if (e.target.id === "wrapper") {
            setShowAddTokenModal(false)
            setError(false)
            setTokenAdded(false)
        }
    }

    return (
        <div
            id="wrapper"
            className="fixed inset-0 backdrop-blur-sm bg-opacity-25 flex justify-center pt-20"
            onClick={(e) => {
                handle(e)
            }}
        >
            <div className="h-fit bg-slate-500 w-11/12 sm:w-[30rem]  p-3 rounded-lg">
                <div className="flex justify-between">
                    <h1 className="mb-2 font-bold text-blue-50 text-xl font-mono">
                        {" "}
                        Import Token{" "}
                    </h1>
                    <button
                        className="bg-red-500 hover:bg-red-700 font-bold text-white py-1 px-2 rounded-lg mb-2 self-end"
                        onClick={async function () {
                            setShowAddTokenModal(false)
                            setError(false)
                            setTokenAdded(false)
                        }}
                    >
                        <div className="text-sm font-semibold">X</div>
                    </button>
                </div>
                {loading ? (
                    <div className="flex flex-col items-center p-3">
                        {" "}
                        <Loading
                            direction="right"
                            fontSize={20}
                            size={30}
                            spinnerColor="#a5f3fc"
                            spinnerType="wave"
                        />
                        <p className="text-2xl font-semibold text-cyan-200">Adding...</p>
                    </div>
                ) : tokenAdded ? (
                    tokenAdded == "Successful" ? (
                        <div className="flex justify-around p-3">
                            <ImCheckmark className="text-5xl text-cyan-200" />
                            <p className="text-3xl text-cyan-200">Token Added</p>
                        </div>
                    ) : (
                        <div className="flex justify-around p-3">
                            <ImCancelCircle className="text-5xl text-red-500" />
                            <p className="text-3xl text-red-500">Failed</p>
                        </div>
                    )
                ) : (
                    <div className="p-3">
                        <input
                            className={`focus:shadow-3xl bg-slate-500 rounded-lg w-full  placeholder:text-slate-100 p-1 text-slate-50 border-2 outline-none
                ${
                    error
                        ? ` focus:shadow-red-700  border-red-700 `
                        : `focus:shadow-blue-500  border-blue-500`
                }`}
                            placeholder="Token Address"
                            onChange={(e) => {
                                setTokenAddress(e.target.value)
                            }}
                        ></input>
                        <p className="mb-2 text-sm text-red-700 font-bold">{error}</p>
                        <button
                            className="w-full shadow-md shadow-blue-900 hover:shadow-none bg-blue-500 text-white font-semibold text-md p-1 rounded-lg"
                            onClick={() => {
                                submit()
                            }}
                        >
                            Import
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
