import { useEffect, useState } from "react"
import { useMoralis, useWeb3Contract } from "react-moralis"
import SushiSwapABI from "../constants/sushiABIs.json"
import { ethers } from "ethers"
import { Loading, useNotification } from "@web3uikit/core"
import { swapWithSushi } from "../Utils/swapFunctions"

export const GetSushiSwapPrice = ({
    token1,
    token2,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    outputDecimal,
    inputDecimal,
    swapType,
    slippage,
    provider,
    setSushiSwapPrice,
    setSushiButton,
}) => {
    const [price, setPrice] = useState()
    const [isFetching, setIsFetching] = useState(false)
    const [priceUsedForCalc, setPriceUsedForCalc] = useState()
    const [sushistate, setSushiState] = useState()
    const [sushiTxLoading, setSushiTxLoading] = useState(false)
    const [sushiSwapTxLoadingText, setSushiTxLoadingText] = useState("")
    const [tokenInputUsed, setTokenInputUsed] = useState()
    const [tokenOutputUsed, setTokenOutputUsed] = useState()

    const dispatch = useNotification()
    const { isWeb3Enabled } = useMoralis()
    useEffect(() => {
        setSushiButton(document.getElementById("sushiButton"))
    })

    const Address = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
    const ABI = SushiSwapABI[Address]
    let Amount
    if (swapType == 1) {
        input == 0 || input == undefined
            ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
            : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))
    } else if (swapType == 2) {
        output == 0 || output == undefined
            ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
            : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))
    }

    const getPrice = async () => {
        try {
            const Contract = new ethers.Contract(Address, ABI, provider)
            setIsFetching(true)
            if (swapType == 1) {
                const tx = await Contract.getAmountsOut(Amount, [
                    tokenInputAddress,
                    tokenOutputAddress,
                ])
                setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                setTokenInputUsed(tokenInputAddress)
                handle(tx[1])
                setIsFetching(false)
                setTokenOutputUsed(tokenOutputAddress)
            } else if (swapType == 2) {
                const tx = await Contract.getAmountsIn(Amount, [
                    tokenInputAddress,
                    tokenOutputAddress,
                ])
                setIsFetching(false)
                handle(tx[0])
                setPriceUsedForCalc(Number(output) > 0 ? output : "1")
                setTokenInputUsed(tokenInputAddress)
                setTokenOutputUsed(tokenOutputAddress)
            }
        } catch (e) {
            setIsFetching(false)
            swapType == 1
                ? setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                : setPriceUsedForCalc(Number(output) > 0 ? output : "1")
            setTokenInputUsed(tokenInputAddress)
            setTokenOutputUsed(tokenOutputAddress)
            setPrice("0.00")
        }
    }

    const handle = (tx) => {
        let decimal
        swapType == 1 ? (decimal = outputDecimal) : (decimal = inputDecimal)
        const result = ethers.utils.formatUnits(tx.toString(), decimal)
        console.log(`tx = ${result}`)
        const price = Number(result) > 1 ? Number(result).toFixed(3) : Number(result).toPrecision(3)
        setPrice(price)
    }

    const swap = () => {
        swapWithSushi(
            token1,
            token2,
            priceUsedForCalc,
            price,
            inputDecimal,
            outputDecimal,
            tokenInputAddress,
            tokenOutputAddress,
            swapType,
            slippage,
            isWeb3Enabled,
            provider,
            dispatch,
            setSushiTxLoading,
            setSushiTxLoadingText
        )
    }

    useEffect(() => {
        setSushiSwapPrice(price)
    }, [price])

    useEffect(() => {
        if (isFetching == true || price <= 0) {
            setSushiState(true)
            setSushiSwapPrice(0)
        } else {
            setSushiState(false)
        }
    }, [isFetching, price])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = input == undefined || input == "" || input == 0 ? "1" : input
                const amountOut = output == undefined || output == "" || output == 0 ? "1" : output
                if (priceUsedForCalc != amountIn && swapType == 1 && isFetching != true) {
                    getPrice()
                } else if (priceUsedForCalc != amountOut && swapType == 2 && isFetching != true) {
                    getPrice()
                }

                if (
                    (tokenInputUsed != tokenInputAddress ||
                        tokenOutputUsed != tokenOutputAddress) &&
                    isFetching != true
                ) {
                    getPrice()
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [
        input,
        priceUsedForCalc,
        output,
        price,
        swapType,
        tokenInputAddress,
        tokenOutputAddress,
        tokenInputUsed,
        tokenOutputUsed,
        isFetching,
    ])

    return (
        <div>
            {sushiTxLoading == true ? (
                <div class="rounded-md border-current bg-green-500 px-8 py-1 ">
                    <Loading
                        direction="right"
                        fontSize={15}
                        size={15}
                        spinnerType="loader"
                        text={sushiSwapTxLoadingText}
                    />
                </div>
            ) : (
                <button
                    disabled={sushistate}
                    className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                    id="sushiButton"
                    onClick={async () => {
                        if (input > 0) {
                            swap()
                        } else {
                            console.log(`please enter amount`)
                        }
                    }}
                >
                    {isFetching ? (
                        <p className="text-zinc-100 font-semibold text-sm">
                            Fetching Price from SushiSwap...
                        </p>
                    ) : price <= 0 ? (
                        <p className="text-zinc-100 font-semibold text-sm">
                            Swap not Available on SushiSwap
                        </p>
                    ) : (
                        <p className="text-zinc-100 font-semibold text-sm">
                            Get {swapType == 2 ? priceUsedForCalc : price} {""} {token2} for{" "}
                            {swapType == 2 ? price : priceUsedForCalc} {token1} on sushiswap
                        </p>
                    )}
                </button>
            )}
        </div>
    )
}
