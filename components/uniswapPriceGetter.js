import { useEffect, useState } from "react"
import uniSwapABI from "../constants/uniSwapABI.json"
import { ethers } from "ethers"
import { swapWithUniswap } from "../Utils/swapFunctions"
import { Loading, useNotification } from "@web3uikit/core"
import { useMoralis } from "react-moralis"

export const GetUniswapPrice = ({
    token1,
    token2,
    tokenInputAddress,
    tokenOutputAddress,
    input,
    output,
    inputDecimal,
    outputDecimal,
    swapType,
    provider,
    setUniSwapPrice,
    slippage,
    setUniswapButton,
}) => {
    const [isFetching, setIsFetching] = useState(false)
    const [tokenInputUsed, setTokenInputUsed] = useState()
    const [tokenOutputUsed, setTokenOutputUsed] = useState()
    const [price, setPrice] = useState()
    const [priceUsedForCalc, setPriceUsedForCalc] = useState()
    const [state, setState] = useState()
    const [uniSwapTxLoading, setUniSwapTxLoading] = useState(false)
    const [uniSwapTxLoadingText, setUniSwapTxLoadingText] = useState("")
    const { isWeb3Enabled } = useMoralis()
    const dispatch = useNotification()

    useEffect(() => {
        setUniswapButton(document.getElementById("uniswapButton"))
    })

    const swap = () => {
        swapWithUniswap(
            priceUsedForCalc,
            price,
            inputDecimal,
            outputDecimal,
            tokenInputAddress,
            tokenOutputAddress,
            dispatch,
            slippage,
            swapType,
            isWeb3Enabled,
            provider,
            setUniSwapTxLoading,
            setUniSwapTxLoadingText
        )
    }

    const Address = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
    const ABI = uniSwapABI[Address]
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
            setIsFetching(true)
            const Contract = new ethers.Contract(Address, ABI, provider)
            if (swapType == 1) {
                const result = await Contract.callStatic.quoteExactInputSingle(
                    tokenInputAddress,
                    tokenOutputAddress,
                    3000,
                    Amount.toString(),
                    0
                )
                handle(result)
                setIsFetching(false)
                setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                setTokenInputUsed(tokenInputAddress)
                setTokenOutputUsed(tokenOutputAddress)
            } else if (swapType == 2) {
                const result = await Contract.callStatic.quoteExactOutputSingle(
                    tokenInputAddress,
                    tokenOutputAddress,
                    3000,
                    Amount.toString(),
                    0
                )
                handle(result)
                console.log(result)
                setIsFetching(false)
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
            console.log(e)
        }
    }

    const handle = async (result) => {
        let decimal
        swapType == 1 ? (decimal = outputDecimal) : (decimal = inputDecimal)
        const amountOut = ethers.utils.formatUnits(result.toString(), decimal)
        const price =
            Number(amountOut) > 1 ? Number(amountOut).toFixed(3) : Number(amountOut).toPrecision(3)

        setPrice(price)
    }

    useEffect(() => {
        setUniSwapPrice(price)
    }, [price])

    useEffect(() => {
        if (isFetching == true || price <= 0) {
            setState(true)
            setUniSwapPrice(0)
        } else {
            setState(false)
        }
    }, [isFetching, price])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = input == undefined || input == "" ? "1" : input
                const amountOut = output == undefined || output == "" ? "1" : output
                if (priceUsedForCalc != amountIn && swapType == 1 && isFetching != true) {
                    getPrice()
                    console.log(`balancer amount1 = ${amountIn}`)
                    console.log(`calc price ${priceUsedForCalc}`)
                } else if (priceUsedForCalc != amountOut && swapType == 2 && isFetching != true) {
                    getPrice()
                    console.log(`balancer amount2 = ${amountOut}`)
                    console.log(`calc price ${priceUsedForCalc}`)
                }
                if (
                    (tokenInputUsed != tokenInputAddress ||
                        tokenOutputUsed != tokenOutputAddress) &&
                    isFetching != true
                ) {
                    getPrice()
                    console.log(`uniswap Addresses = ${tokenInputAddress}// ${tokenInputUsed}`)
                    console.log(`calc price ${isFetching}`)
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
            {uniSwapTxLoading == true ? (
                <div class="rounded-md border-current bg-green-500 px-8 py-1">
                    <Loading
                        direction="right"
                        fontSize={15}
                        size={15}
                        spinnerType="loader"
                        text={uniSwapTxLoadingText}
                    />
                </div>
            ) : (
                <button
                    disabled={state}
                    className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                    id="uniswapButton"
                    onClick={async () => {
                        if (input > 0) {
                            swap()
                        } else {
                            console.log("Enter Amount")
                        }
                    }}
                >
                    <div>
                        {isFetching ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Fetching Price from Uniswap...
                            </p>
                        ) : price <= 0 ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                {" "}
                                Swap not Available on Uniswap
                            </p>
                        ) : (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Get {swapType == 2 ? priceUsedForCalc : price} {""} {token2} for{" "}
                                {swapType == 2 ? price : priceUsedForCalc} {token1} on Uniswap
                            </p>
                        )}
                    </div>
                </button>
            )}
        </div>
    )
}
