import { useNotification, Loading } from "@web3uikit/core"
import { useState, useEffect } from "react"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import {
    getBalancerPrice,
    getCurvePrice,
    getSushiSwapPrice,
    getUniswapPrice,
} from "../Utils/priceGetters"
import {
    swapWithBalancer,
    swapWithCurve,
    swapWithSushi,
    swapWithUniswap,
} from "../Utils/swapFunctions"
import { Select } from "./select"
import { ThePage } from "./thePage"
import { SetSlippage } from "./setSlippage"
import { AddToken } from "./addToken"

export default function PriceFunctions() {
    const { isWeb3Enabled, enableWeb3 } = useMoralis()
    const [token1, setToken1] = useState("ETH")
    const [token2, setToken2] = useState("USDT")
    const [amount1, setAmount1] = useState(1)
    const [amount2, setAmount2] = useState(0)
    const [tokenInputAddress, setTokenInputAddress] = useState(
        "0x0000000000000000000000000000000000000123"
    )
    const [tokenOutputAddress, setTokenOutputAddress] = useState(
        "0xdAC17F958D2ee523a2206206994597C13D831ec7"
    )
    const [inputDecimal, setInputDecimal] = useState(18)
    const [outputDecimal, setOutputDecimal] = useState(6)
    const [bestRate, setBestRate] = useState()
    const [active, setActive] = useState("1")

    const [uniSwapPrice, setUniSwapPrice] = useState("init")
    const [sushiSwapPrice, setSushiSwapPrice] = useState("init")
    const [curveSwapPrice, setCurveSwapPrice] = useState("init")
    const [balancerPrice, setBalancerPrice] = useState("init")
    const [balancerSwaps, setBalancerSwaps] = useState()
    const [balancerTokenAddresses, setBalancerTokenAddresses] = useState()
    const [balancerPriceLimits, setBalancerTokenLimits] = useState([])
    const [balstate, setBalState] = useState()
    const [balancerInputUsedForPriceCalc, setbalancerInputUsedForPriceCalc] = useState()
    const [curveInputUsedForPriceCalc, setCurveInputUsedForPriceCalc] = useState()
    const [uniswapInputUsedForPriceCalc, setUniswapInputUsedForPriceCalc] = useState()
    const [sushiswapInputUsedForPriceCalc, setSushiswapInputUsedForPriceCalc] = useState()
    const [curvestate, setCurveState] = useState()
    const [sushistate, setSushiState] = useState()
    const [unistate, setUniState] = useState()
    const [uniswapTokenInputUsed, setUniswapTokenInputUsed] = useState()
    const [uniswapTokenOutputUsed, setUniswapTokenOutputUsed] = useState()
    const [sushiswapTokenInputUsed, setSushiswapTokenInputUsed] = useState()
    const [sushiswapTokenOutputUsed, setSushiswapTokenOutputUsed] = useState()
    const [curveTokenInputUsed, setCurveTokenInputUsed] = useState()
    const [curveTokenOutputUsed, setCurveTokenOutputUsed] = useState()
    const [balancerTokenInputUsed, setBalancerTokenInputUsed] = useState()
    const [balancerTokenOutputUsed, setBalancerTokenOutputUsed] = useState()
    const dispatch = useNotification()

    const [uniSwapTxLoading, setUniSwapTxLoading] = useState(false)
    const [uniSwapTxLoadingText, setUniSwapTxLoadingText] = useState("")
    const [sushiTxLoading, setSushiTxLoading] = useState(false)
    const [sushiSwapTxLoadingText, setSushiTxLoadingText] = useState("")
    const [curveTxLoading, setCurveTxLoading] = useState(false)
    const [curveTxLoadingText, setCurveTxLoadingText] = useState("")
    const [balancerTxLoading, setBalancerTxLoading] = useState(false)
    const [balancerTxLoadingText, setBalancerTxLoadingText] = useState("")

    const [swapType, setSwapType] = useState(1)
    const [web3Provider, setWeb3Provider] = useState()
    const [showModal, setShowModal] = useState(false)
    const [tokenNum, setTokenNum] = useState()
    const [curvePoolAddress, setCurvePoolAddress] = useState()

    const [showSlippageModal, setShowSlippageModal] = useState(false)
    const [slippage, setSlippage] = useState(5)
    const [showAddTokenModal, setShowAddTokenModal] = useState(false)

    useEffect(() => {
        if (isWeb3Enabled) {
            async function getProvider() {
                const provider = await enableWeb3()
                setWeb3Provider(provider)
            }
            getProvider()
        } else {
            const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY
            const provider = new ethers.providers.JsonRpcProvider(INFURA_API_KEY)
            setWeb3Provider(provider)
        }
    }, [isWeb3Enabled])

    const swap = async (dex) => {
        if (dex == "swap with uniswap") {
            swapWithUniswap(
                uniswapInputUsedForPriceCalc,
                uniSwapPrice,
                inputDecimal,
                outputDecimal,
                tokenInputAddress,
                tokenOutputAddress,
                dispatch,
                slippage,
                swapType,
                isWeb3Enabled,
                web3Provider,
                setUniSwapTxLoading,
                setUniSwapTxLoadingText
            )
        } else if (dex == "swap with sushiswap") {
            swapWithSushi(
                sushiswapInputUsedForPriceCalc,
                sushiSwapPrice,
                inputDecimal,
                outputDecimal,
                tokenInputAddress,
                tokenOutputAddress,
                swapType,
                slippage,
                isWeb3Enabled,
                web3Provider,
                dispatch,
                setSushiTxLoading,
                setSushiTxLoadingText
            )
        } else if (dex == "swap with curve") {
            swapWithCurve(
                curveInputUsedForPriceCalc,
                inputDecimal,
                curveSwapPrice,
                outputDecimal,
                tokenInputAddress,
                tokenOutputAddress,
                curvePoolAddress,
                swapType,
                isWeb3Enabled,
                slippage,
                web3Provider,
                dispatch,
                setCurveTxLoading,
                setCurveTxLoadingText
            )
        } else if (dex == "swap with balancer") {
            swapWithBalancer(
                tokenInputAddress,
                tokenOutputAddress,
                balancerSwaps,
                balancerTokenAddresses,
                balancerPriceLimits,
                swapType,
                slippage,
                isWeb3Enabled,
                web3Provider,
                dispatch,
                setBalancerTxLoading,
                setBalancerTxLoadingText
            )
        }
    }
    const uniSwapPriceGetter = () => {
        getUniswapPrice(
            web3Provider,
            amount1,
            amount2,
            tokenInputAddress,
            tokenOutputAddress,
            outputDecimal,
            inputDecimal,
            swapType,
            setUniSwapPrice,
            setUniswapInputUsedForPriceCalc,
            setUniswapTokenInputUsed,
            setUniswapTokenOutputUsed
        )
    }

    const sushiSwapPriceGetter = () => {
        getSushiSwapPrice(
            web3Provider,
            amount1,
            amount2,
            tokenInputAddress,
            tokenOutputAddress,
            outputDecimal,
            inputDecimal,
            swapType,
            setSushiSwapPrice,
            setSushiswapInputUsedForPriceCalc,
            setSushiswapTokenInputUsed,
            setSushiswapTokenOutputUsed
        )
    }

    const curveSwapPriceGetter = () => {
        getCurvePrice(
            web3Provider,
            amount1,
            amount2,
            tokenInputAddress,
            tokenOutputAddress,
            outputDecimal,
            inputDecimal,
            swapType,
            setCurveSwapPrice,
            setCurveInputUsedForPriceCalc,
            setCurveTokenInputUsed,
            setCurveTokenOutputUsed,
            setCurvePoolAddress
        )
    }

    const balancerSwapPriceGetter = () => {
        getBalancerPrice(
            web3Provider,
            amount1,
            amount2,
            tokenInputAddress,
            tokenOutputAddress,
            outputDecimal,
            inputDecimal,
            swapType,
            setBalancerPrice,
            setBalancerSwaps,
            setBalancerTokenAddresses,
            setBalancerTokenLimits,
            setbalancerInputUsedForPriceCalc,
            setBalancerTokenInputUsed,
            setBalancerTokenOutputUsed
        )
    }

    useEffect(() => {
        const interval = setInterval(() => {
            if ((tokenInputAddress && tokenOutputAddress) != undefined) {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    balancerInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    balancerPrice != "wait.."
                ) {
                    balancerSwapPriceGetter()
                } else if (
                    balancerInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    balancerPrice != "wait.."
                ) {
                    balancerSwapPriceGetter()
                }
                if (
                    (balancerTokenInputUsed != tokenInputAddress ||
                        balancerTokenOutputUsed != tokenOutputAddress) &&
                    balancerPrice != "wait.."
                ) {
                    balancerSwapPriceGetter()
                }
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [
        amount1,
        balancerInputUsedForPriceCalc,
        amount2,
        balancerPrice,
        swapType,
        balancerTokenInputUsed,
        balancerTokenOutputUsed,
        tokenInputAddress,
        tokenOutputAddress,
    ])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    curveInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    curveSwapPrice != "wait.."
                ) {
                    curveSwapPriceGetter()
                } else if (
                    curveInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    curveSwapPrice != "wait.."
                ) {
                    curveSwapPriceGetter()
                }
                if (
                    (curveTokenInputUsed != tokenInputAddress ||
                        curveTokenOutputUsed != tokenOutputAddress) &&
                    curveSwapPrice != "wait.."
                ) {
                    curveSwapPriceGetter()
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [
        amount1,
        curveInputUsedForPriceCalc,
        amount2,
        curveSwapPrice,
        swapType,
        curveTokenInputUsed,
        curveTokenOutputUsed,
        tokenInputAddress,
        tokenOutputAddress,
    ])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    sushiswapInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    sushiSwapPrice != "wait.."
                ) {
                    sushiSwapPriceGetter()
                } else if (
                    sushiswapInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    sushiSwapPrice != "wait.."
                ) {
                    sushiSwapPriceGetter()
                }
                if (
                    (sushiswapTokenInputUsed != tokenInputAddress ||
                        sushiswapTokenOutputUsed != tokenOutputAddress) &&
                    sushiSwapPrice != "wait.."
                ) {
                    sushiSwapPriceGetter()
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [
        amount1,
        sushiswapInputUsedForPriceCalc,
        amount2,
        sushiSwapPrice,
        swapType,
        sushiswapTokenInputUsed,
        sushiswapTokenOutputUsed,
        tokenInputAddress,
        tokenOutputAddress,
    ])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress) != undefined) {
            const interval = setInterval(() => {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    uniswapInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    uniSwapPrice != "wait.."
                ) {
                    uniSwapPriceGetter()
                } else if (
                    uniswapInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    uniSwapPrice != "wait.."
                ) {
                    uniSwapPriceGetter()
                }

                if (
                    (uniswapTokenInputUsed != tokenInputAddress ||
                        uniswapTokenOutputUsed != tokenOutputAddress) &&
                    uniSwapPrice != "wait.."
                ) {
                    uniSwapPriceGetter()
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [
        amount1,
        uniswapInputUsedForPriceCalc,
        amount2,
        uniSwapPrice,
        swapType,
        tokenInputAddress,
        tokenOutputAddress,
        uniswapTokenInputUsed,
        uniswapTokenOutputUsed,
    ])

    useEffect(() => {
        const bal = balancerPrice == "wait.." ? 0 : balancerPrice
        const uni = uniSwapPrice == "wait.." ? 0 : uniSwapPrice
        const sushi = sushiSwapPrice == "wait.." ? 0 : sushiSwapPrice
        const curve = curveSwapPrice == "wait.." ? 0 : curveSwapPrice
        const rates = [Number(uni), Number(sushi), Number(curve), Number(bal)]
        if (swapType == 1) {
            const bestrate = Math.max.apply(
                null,
                rates.filter((rate) => rate > 0)
            )
            setBestRate(bestrate)
        } else if (swapType == 2) {
            const bestrate = Math.min.apply(
                null,
                rates.filter((rate) => rate > 0)
            )
            setBestRate(bestrate)
        }
    }, [uniSwapPrice, sushiSwapPrice, curveSwapPrice, balancerPrice])

    useEffect(() => {
        if (uniSwapPrice == "wait.." || uniSwapPrice <= 0 || uniSwapPrice == "init") {
            setUniState(true)
        } else {
            setUniState(false)
        }

        if (sushiSwapPrice == "wait.." || sushiSwapPrice <= 0 || sushiSwapPrice == "init") {
            setSushiState(true)
        } else {
            setSushiState(false)
        }

        if (curveSwapPrice == "wait.." || curveSwapPrice <= 0 || curveSwapPrice == "init") {
            setCurveState(true)
        } else {
            setCurveState(false)
        }

        if (balancerPrice == "wait.." || balancerPrice <= 0 || balancerPrice == "init") {
            setBalState(true)
        } else {
            setBalState(false)
        }
    }, [uniSwapPrice, sushiSwapPrice, balancerPrice, curveSwapPrice])

    useEffect(() => {
        if (active == "1") {
            setAmount2(bestRate > 1 ? Number(bestRate).toFixed(3) : Number(bestRate).toPrecision(3))
            setSwapType(1)
        } else if (active == "2") {
            setAmount1(bestRate > 1 ? Number(bestRate).toFixed(3) : Number(bestRate).toPrecision(3))
            setSwapType(2)
        }
    }, [bestRate, active])

    useEffect(() => {}, [])

    const swapWithBest = async () => {
        let indexOfBestRate
        const bal = Number(balancerPrice) > 0 ? balancerPrice : 0
        const uni = Number(uniSwapPrice) > 0 ? uniSwapPrice : 0
        const sushi = Number(sushiSwapPrice) > 0 ? sushiSwapPrice : 0
        const curve = Number(curveSwapPrice) > 0 ? curveSwapPrice : 0

        const rates = [Number(uni), Number(sushi), Number(curve), Number(bal)]
        if (swapType == 1) {
            const bestrate = Math.max.apply(
                null,
                rates.filter((rate) => rate > 0)
            )

            indexOfBestRate = rates.indexOf(bestrate)
        } else if (swapType == 2) {
            const bestrate = Math.min.apply(
                null,
                rates.filter((rate) => rate > 0)
            )

            indexOfBestRate = rates.indexOf(bestrate)
        }

        if (indexOfBestRate == 0) {
            uniswapButton.click()
        } else if (indexOfBestRate == 1) {
            sushiButton.click()
        } else if (indexOfBestRate == 2) {
            curveButton.click()
        } else if (indexOfBestRate == 3) {
            balancerButton.click()
        } else {
            console.log("-------")
        }
    }

    return (
        <div class=" bg-slate-400 h-full min-h-screen flex flex-col items-center py-6">
            <ThePage
                setSlippagePercent={setSlippage}
                setToken1={setToken1}
                setToken2={setToken2}
                setAmount1={setAmount1}
                setAmount2={setAmount2}
                token1={token1}
                token2={token2}
                amount1={amount1}
                amount2={amount2}
                setActive={setActive}
                setTokenNum={setTokenNum}
                setShowModal={setShowModal}
                setShowSlippageModal={setShowSlippageModal}
                swapWithBest={swapWithBest}
                bestRate={bestRate}
            />

            <div className=" bg-slate-600 rounded-lg sm:w-96 w-11/12 flex flex-col items-center px-2">
                {/** UNISWAP--------------------------------------------------------------------------------------------------------------- */}

                <div className="m-2 w-full">
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
                            disabled={unistate}
                            className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                            id="uniswapButton"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with uniswap")
                                } else {
                                    console.log("Enter Amount")
                                }
                            }}
                        >
                            <div>
                                {uniSwapPrice == "wait.." || uniSwapPrice == "init" ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Fetching Price from Uniswap...
                                    </p>
                                ) : uniSwapPrice <= 0 ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        {" "}
                                        Swap not Available on Uniswap
                                    </p>
                                ) : (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Get{" "}
                                        {swapType == 2
                                            ? uniswapInputUsedForPriceCalc > 1
                                                ? Number(uniswapInputUsedForPriceCalc).toFixed(3)
                                                : Number(uniswapInputUsedForPriceCalc).toPrecision(
                                                      3
                                                  )
                                            : uniSwapPrice > 1
                                            ? Number(uniSwapPrice).toFixed(3)
                                            : Number(uniSwapPrice).toPrecision(3)}{" "}
                                        {token2} for{" "}
                                        {swapType == 2
                                            ? uniSwapPrice > 1
                                                ? Number(uniSwapPrice).toFixed(3)
                                                : Number(uniSwapPrice).toPrecision(3)
                                            : uniswapInputUsedForPriceCalc > 1
                                            ? Number(uniswapInputUsedForPriceCalc).toFixed(3)
                                            : Number(uniswapInputUsedForPriceCalc).toPrecision(
                                                  3
                                              )}{" "}
                                        {token1} on Uniswap
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </div>

                {/**SUSHI----------------------------------------------------------------------------------------------------------------*/}

                <div className="m-2 w-full">
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
                                if (amount1 > 0) {
                                    swap("swap with sushiswap")
                                } else {
                                    console.log(`please enter amount`)
                                }
                            }}
                        >
                            {sushiSwapPrice == "wait.." || sushiSwapPrice == "init" ? (
                                <p className="text-zinc-100 font-semibold text-sm">
                                    Fetching Price from SushiSwap...
                                </p>
                            ) : sushiSwapPrice <= 0 ? (
                                <p className="text-zinc-100 font-semibold text-sm">
                                    Swap not Available on SushiSwap
                                </p>
                            ) : (
                                <p className="text-zinc-100 font-semibold text-sm">
                                    Get{" "}
                                    {swapType == 2
                                        ? sushiswapInputUsedForPriceCalc > 1
                                            ? Number(sushiswapInputUsedForPriceCalc).toFixed(3)
                                            : Number(sushiswapInputUsedForPriceCalc).toPrecision(3)
                                        : sushiSwapPrice > 1
                                        ? Number(sushiSwapPrice).toFixed(3)
                                        : Number(sushiSwapPrice).toPrecision(3)}{" "}
                                    {token2} for{" "}
                                    {swapType == 2
                                        ? sushiSwapPrice > 1
                                            ? Number(sushiSwapPrice).toFixed(3)
                                            : Number(sushiSwapPrice).toPrecision(3)
                                        : sushiswapInputUsedForPriceCalc > 1
                                        ? Number(sushiswapInputUsedForPriceCalc).toFixed(3)
                                        : Number(sushiswapInputUsedForPriceCalc).toPrecision(
                                              3
                                          )}{" "}
                                    {token1} on sushiswap
                                </p>
                            )}
                        </button>
                    )}
                </div>

                {/* CURVE ----------------------------------------------------------------------------------------------------------------*/}

                <div className="m-2 w-full">
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
                            disabled={curvestate}
                            className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                            id="curveButton"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with curve")
                                } else {
                                    console.log("please enter amount")
                                }
                            }}
                        >
                            <div>
                                {curveSwapPrice == "wait.." || curveSwapPrice == "init" ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Fetching Price from Curve...
                                    </p>
                                ) : curveSwapPrice <= 0 ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Swap not Available on Curve
                                    </p>
                                ) : (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Get{" "}
                                        {swapType == 2
                                            ? curveInputUsedForPriceCalc > 1
                                                ? Number(curveInputUsedForPriceCalc).toFixed(3)
                                                : Number(curveInputUsedForPriceCalc).toPrecision(3)
                                            : curveSwapPrice > 1
                                            ? Number(curveSwapPrice).toFixed(3)
                                            : Number(curveSwapPrice).toPrecision(3)}{" "}
                                        {token2} for{" "}
                                        {swapType == 2
                                            ? curveSwapPrice > 1
                                                ? Number(curveSwapPrice).toFixed(3)
                                                : Number(curveSwapPrice).toPrecision(3)
                                            : curveInputUsedForPriceCalc > 1
                                            ? Number(curveInputUsedForPriceCalc).toFixed(3)
                                            : Number(curveInputUsedForPriceCalc).toPrecision(
                                                  3
                                              )}{" "}
                                        {token1} on Curve
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </div>

                {/**BALANCER ----------------------------------------------------------------------------------------------------------- */}

                <div className="m-2 w-full">
                    {balancerTxLoading == true ? (
                        <div class="rounded-md border-current bg-green-500 px-8 py-1 ">
                            <Loading
                                direction="right"
                                fontSize={15}
                                size={15}
                                spinnerType="loader"
                                text={balancerTxLoadingText}
                            />
                        </div>
                    ) : (
                        <button
                            disabled={balstate}
                            className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                            id="balancerButton"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with balancer")
                                }
                            }}
                        >
                            <div>
                                {balancerPrice == "wait.." || balancerPrice == "init" ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Fetching Price from Balancer...
                                    </p>
                                ) : balancerPrice <= 0 ? (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Swap not Available on Balancer
                                    </p>
                                ) : (
                                    <p className="text-zinc-100 font-semibold text-sm">
                                        Get{" "}
                                        {swapType == 2
                                            ? balancerInputUsedForPriceCalc > 1
                                                ? Number(balancerInputUsedForPriceCalc).toFixed(3)
                                                : Number(balancerInputUsedForPriceCalc).toPrecision(
                                                      3
                                                  )
                                            : balancerPrice > 1
                                            ? Number(balancerPrice).toFixed(3)
                                            : Number(balancerPrice).toPrecision(3)}{" "}
                                        {token2} for{" "}
                                        {swapType == 2
                                            ? balancerPrice > 1
                                                ? Number(balancerPrice).toFixed(3)
                                                : Number(balancerPrice).toPrecision(3)
                                            : balancerInputUsedForPriceCalc > 1
                                            ? Number(balancerInputUsedForPriceCalc).toFixed(3)
                                            : Number(balancerInputUsedForPriceCalc).toPrecision(
                                                  3
                                              )}{" "}
                                        {token1} on Balancer
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-1 px-2 rounded-lg mb-2 self-end"
                    onClick={async function () {
                        setShowAddTokenModal(true)
                        console.log(curvePoolAddress)
                    }}
                >
                    <div className="text-sm font-semibold">Add Token</div>
                </button>

                <SetSlippage
                    showSlippageModal={showSlippageModal}
                    setShowSlippageModal={setShowSlippageModal}
                    slippage={slippage}
                    setSlippage={setSlippage}
                />
                <Select
                    showModal={showModal}
                    setShowModal={setShowModal}
                    tokenNum={tokenNum}
                    setToken1={setToken1}
                    setToken2={setToken2}
                    setTokenInputAddress={setTokenInputAddress}
                    setTokenOutputAddress={setTokenOutputAddress}
                    setInputDecimal={setInputDecimal}
                    setOutputDecimal={setOutputDecimal}
                />
            </div>
            <AddToken
                web3Provider={web3Provider}
                showAddTokenModal={showAddTokenModal}
                setShowAddTokenModal={setShowAddTokenModal}
            />
        </div>
    )
}
