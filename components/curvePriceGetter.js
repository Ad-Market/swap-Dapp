import { useEffect, useState } from "react"
import CurveABI from "../constants/curveABIs.json"
import { ethers } from "ethers"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { Loading, useNotification } from "@web3uikit/core"
import { swapWithCurve } from "../Utils/swapFunctions"

export const GetCurvePrice = ({
    tokenInputAddress,
    tokenOutputAddress,
    input,
    output,
    swapType,
    inputDecimal,
    outputDecimal,
    setCurveSwapPrice,
    token1,
    token2,
    provider,
    setCurveButton,
    slippage,
}) => {
    const [price, setPrice] = useState()
    const [priceUsedForCalc, setPriceUsedForCalc] = useState()
    const { isWeb3Enabled } = useMoralis()
    const [curveTxLoading, setCurveTxLoading] = useState(false)
    const [curveTxLoadingText, setCurveTxLoadingText] = useState("")
    const [curveState, setCurveState] = useState()
    const [tokenInputUsed, setTokenInputUsed] = useState()
    const [tokenOutputUsed, setTokenOutputUsed] = useState()
    const [isFetching, setIsFetching] = useState(false)
    const dispatch = useNotification()

    useEffect(() => {
        setCurveButton(document.getElementById("curveButton"))
    })

    const swapWithCurvee = () => {
        console.log(price)
        swapWithCurve(
            priceUsedForCalc,
            inputDecimal,
            price,
            outputDecimal,
            tokenInputAddress,
            tokenOutputAddress,
            swapType,
            isWeb3Enabled,
            slippage,
            provider,
            dispatch,
            setCurveTxLoading,
            setCurveTxLoadingText
        )
    }

    const ABI = CurveABI["Vyper"]
    const Address = "0x99a58482BD75cbab83b27EC03CA68fF489b5788f"
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
                const result = await Contract.get_best_rate(
                    tokenInputAddress,
                    tokenOutputAddress,
                    Amount
                )

                setPriceUsedForCalc(Number(input) > 0 ? input : "1")

                setTokenInputUsed(tokenInputAddress)
                handleGetBestRate(result)
                setIsFetching(false)
                setTokenOutputUsed(tokenOutputAddress)
            } else if (swapType == 2) {
                const result = await Contract.get_best_rate(
                    tokenOutputAddress,
                    tokenInputAddress,
                    Amount
                )

                setPriceUsedForCalc(Number(output) > 0 ? output : "1")
                setTokenInputUsed(tokenInputAddress)
                handleGetBestRate(result)
                setIsFetching(false)
                setTokenOutputUsed(tokenOutputAddress)
            }
        } catch (e) {
            setIsFetching(false)

            swapType == 1
                ? setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                : setPriceUsedForCalc(Number(output) > 0 ? output : "1")
            setTokenInputUsed(tokenInputAddress)
            setTokenOutputUsed(tokenOutputAddress)
            console.log(e)
        }
    }

    const handleGetBestRate = async (result) => {
        let decimal
        swapType == 1 ? (decimal = outputDecimal) : (decimal = inputDecimal)
        const amountOut = ethers.utils.formatUnits(result[1].toString(), decimal)
        const price =
            Number(amountOut) > 1 ? Number(amountOut).toFixed(3) : Number(amountOut).toPrecision(3)

        setPrice(price)
    }

    useEffect(() => {
        setCurveSwapPrice(price)
    }, [price])

    useEffect(() => {
        if (isFetching == true || price <= 0) {
            setCurveState(true)
            setCurveSwapPrice(price)
        } else {
            setCurveState(false)
        }
    }, [isFetching, price])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = input == undefined || input == "" ? "1" : input
                const amountOut = output == undefined || output == "" ? "1" : output
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
            {curveTxLoading == true ? (
                <div class="rounded-md border-current bg-green-500 px-8 py-1">
                    <Loading
                        direction="right"
                        fontSize={15}
                        size={15}
                        spinnerType="loader"
                        text={curveTxLoadingText}
                        style={{
                            font: "italic",
                        }}
                    />
                </div>
            ) : (
                <button
                    disabled={curveState}
                    className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                    id="curveButton"
                    onClick={async () => {
                        if (input > 0) {
                            swapWithCurvee()
                        } else {
                            console.log("please enter amount")
                        }
                    }}
                >
                    <div>
                        {isFetching ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Fetching Price from Curve...
                            </p>
                        ) : price <= 0 ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Swap not Available on Curve
                            </p>
                        ) : (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Get {swapType == 2 ? priceUsedForCalc : price} {""} {token2} for{" "}
                                {swapType == 2 ? price : priceUsedForCalc} {token1} on Curve
                            </p>
                        )}
                    </div>
                </button>
            )}
        </div>
    )
}
