import { useNotification, Loading } from "@web3uikit/core"
import { useState, useEffect } from "react"
import Options from "../Utils/listOfTokenAddresses"
import { useMoralis, useWeb3Contract } from "react-moralis"
import { ethers } from "ethers"
import My_form from "./My_form"
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

export default function PriceFunctions({ slippage }) {
    const { isWeb3Enabled, chainId: ChainIdToHex } = useMoralis()
    const [token1, setToken1] = useState("USDT")
    const [token2, setToken2] = useState("ETH")
    const [amount1, setAmount1] = useState(1)
    const [amount2, setAmount2] = useState(0)
    const [tokenInputAddress, setTokenInputAddress] = useState()
    const [tokenOutputAddress, setTokenOutputAddress] = useState()
    const [inputDecimal, setInputDecimal] = useState()
    const [outputDecimal, setOutputDecimal] = useState()
    const [bestRate, setBestRate] = useState()
    const [active, setActive] = useState()

    const [uniSwapPrice, setUniSwapPrice] = useState()
    const [sushiSwapPrice, setSushiSwapPrice] = useState()
    const [curveSwapPrice, setCurveSwapPrice] = useState()
    const [balancerPrice, setBalancerPrice] = useState()
    const [balancerSwaps, setBalancerSwaps] = useState()
    const [balancerTokenAddresses, setBalancerTokenAddresses] = useState()
    const [balcerPriceLimits, setBalancerTokenLimits] = useState([])
    const [balstate, setBalState] = useState()
    const [balancerInputUsedForPriceCalc, setbalancerInputUsedForPriceCalc] = useState()
    const [curveInputUsedForPriceCalc, setCurveInputUsedForPriceCalc] = useState()
    const [uniswapInputUsedForPriceCalc, setUniswapInputUsedForPriceCalc] = useState()
    const [sushiswapInputUsedForPriceCalc, setSushiswapInputUsedForPriceCalc] = useState()
    const [curvestate, setCurveState] = useState()
    const [sushistate, setSushiState] = useState()
    const [unistate, setUniState] = useState()
    const dispatch = useNotification()

    const [uniSwapTxLoading, setUniSwapTxLoading] = useState(false)
    const [uniSwapTxLoadingText, setUniSwapTxLoadingText] = useState("")
    const [sushiTxLoading, setSushiTxLoading] = useState(false)
    const [sushiSwapTxLoadingText, setSushiTxLoadingText] = useState("")
    const [curveTxLoading, setCurveTxLoading] = useState(false)
    const [curveTxLoadingText, setCurveTxLoadingText] = useState("")
    const [balancerTxLoading, setBalancerTxLoading] = useState(false)
    const [balancerTxLoadingText, setBalancerTxLoadingText] = useState("")
    const [bestRateIndex, setBestRateIndex] = useState(0)
    const [swapType, setSwapType] = useState(1)
    const [web3Provider, setWeb3Provider] = useState()

    useEffect(() => {
        setSwapType(1)
        setWeb3Provider(new ethers.providers.Web3Provider(window.ethereum, "any"))
    }, [])

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
                setUniSwapTxLoading,
                setUniSwapTxLoadingText
            )
        } else if (dex == "swap with sushiswap") {
            swapWithSushi(
                token1,
                token2,
                sushiswapInputUsedForPriceCalc,
                sushiSwapPrice,
                inputDecimal,
                outputDecimal,
                tokenInputAddress,
                tokenOutputAddress,
                swapType,
                slippage,
                isWeb3Enabled,
                dispatch,
                setSushiTxLoading,
                setSushiTxLoadingText
            )
        } else if (dex == "swap with curve") {
            swapWithCurve(
                amount1,
                inputDecimal,
                amount2,
                outputDecimal,
                tokenInputAddress,
                tokenOutputAddress,
                swapType,
                isWeb3Enabled,
                dispatch,
                setCurveTxLoading,
                setCurveTxLoadingText
            )
        } else if (dex == "swap with balancer") {
            swapWithBalancer(
                balancerSwaps,
                balancerTokenAddresses,
                balcerPriceLimits,
                swapType,
                slippage,
                isWeb3Enabled,
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
            setUniswapInputUsedForPriceCalc
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
            setSushiswapInputUsedForPriceCalc
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
            setCurveInputUsedForPriceCalc
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
            setbalancerInputUsedForPriceCalc
        )
    }

    useEffect(() => {
        AddressandDecimal(token1, token2)
    }, [token2, token1])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress && window.ethereum) != undefined) {
            balancerSwapPriceGetter()
            uniSwapPriceGetter()
            curveSwapPriceGetter()
            sushiSwapPriceGetter()
        }
    }, [tokenInputAddress, tokenOutputAddress])

    useEffect(() => {
        const interval = setInterval(() => {
            if ((tokenInputAddress && tokenOutputAddress && window.ethereum) != undefined) {
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
            }
        }, 1000)
        return () => clearInterval(interval)
    }, [amount1, balancerInputUsedForPriceCalc, amount2, balancerPrice, swapType])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress && window.ethereum) != undefined) {
            const interval = setInterval(() => {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    curveInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    curveSwapPrice != "wait.."
                ) {
                    curveSwapPriceGetter()
                    console.log(`amount1 = ${amountIn}`)
                    console.log(`calc price ${curveInputUsedForPriceCalc}`)
                } else if (
                    curveInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    curveSwapPrice != "wait.."
                ) {
                    curveSwapPriceGetter()
                    console.log(`amount2 = ${amountOut}`)
                    console.log(`calc price ${curveInputUsedForPriceCalc}`)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [amount1, curveInputUsedForPriceCalc, amount2, curveSwapPrice, swapType])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress && window.ethereum) != undefined) {
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
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [amount1, sushiswapInputUsedForPriceCalc, amount2, sushiSwapPrice, swapType])

    useEffect(() => {
        if ((tokenInputAddress && tokenOutputAddress && window.ethereum) != undefined) {
            const interval = setInterval(() => {
                const amountIn = amount1 == undefined || amount1 == "" ? "1" : amount1
                const amountOut = amount2 == undefined || amount2 == "" ? "1" : amount2
                if (
                    uniswapInputUsedForPriceCalc != amountIn &&
                    swapType == 1 &&
                    uniSwapPrice != "wait.."
                ) {
                    uniSwapPriceGetter()
                    console.log(`amount1 = ${amountIn}`)
                    console.log(`calc price ${uniswapInputUsedForPriceCalc}`)
                } else if (
                    uniswapInputUsedForPriceCalc != amountOut &&
                    swapType == 2 &&
                    uniSwapPrice != "wait.."
                ) {
                    uniSwapPriceGetter()
                    console.log(`amount2 = ${amountOut}`)
                    console.log(`calc price ${uniswapInputUsedForPriceCalc}`)
                }
            }, 1000)
            return () => clearInterval(interval)
        }
    }, [amount1, uniswapInputUsedForPriceCalc, amount2, uniSwapPrice, swapType])

    const AddressandDecimal = async (tokeninput, tokenoutput) => {
        await get(tokeninput).then(async (result) => {
            setTokenInputAddress(result[1])
            setInputDecimal(result[0])
        })

        await get(tokenoutput).then(async (result) => {
            setTokenOutputAddress(result[1])
            setOutputDecimal(result[0])
        })
    }

    useEffect(() => {
        let indexOfBestRate
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
            indexOfBestRate = rates.indexOf(bestrate)
        } else if (swapType == 2) {
            const bestrate = Math.min.apply(
                null,
                rates.filter((rate) => rate > 0)
            )
            setBestRate(bestrate)
            indexOfBestRate = rates.indexOf(bestrate)
        }

        switch (indexOfBestRate) {
            case 0:
                setBestRateIndex("swap with uniswap")
                break
            case 1:
                setBestRateIndex("swap with sushiswap")
                break
            case 2:
                setBestRateIndex("swap with curve")
                break
            case 3:
                setBestRateIndex("swap with balancer")
                break

            default:
                setBestRateIndex("-------")
                break
        }
    }, [uniSwapPrice, sushiSwapPrice, curveSwapPrice, balancerPrice])

    useEffect(() => {
        if (uniSwapPrice == "wait.." || uniSwapPrice <= 0) {
            setUniState(true)
        } else {
            setUniState(false)
        }

        if (sushiSwapPrice == "wait.." || sushiSwapPrice <= 0) {
            setSushiState(true)
        } else {
            setSushiState(false)
        }

        if (curveSwapPrice == "wait.." || curveSwapPrice <= 0) {
            setCurveState(true)
        } else {
            setCurveState(false)
        }

        if (balancerPrice == "wait.." || balancerPrice <= 0) {
            setBalState(true)
        } else {
            setBalState(false)
        }
    }, [uniSwapPrice, sushiSwapPrice, balancerPrice, curveSwapPrice])

    useEffect(() => {
        if (active == "1") {
            setAmount2(bestRate > 1 ? Number(bestRate).toFixed(3) : Number(bestRate).toPrecision(3))
            setSwapType(1)
            if (amount1 == "" || amount1 == undefined) {
                setAmount2(0)
            }
        } else if (active == "2") {
            setAmount1(bestRate > 1 ? Number(bestRate).toFixed(3) : Number(bestRate).toPrecision(3))
            setSwapType(2)
            if (amount2 == "" || amount2 == undefined) {
                setAmount1(0)
            }
        }
    }, [bestRate, active])

    useEffect(() => {
        console.log(active)
    }, [active])

    return (
        <div class="lg:grid grid-cols-4 gap-4 my-4">
            <div class="bg-blue-50 col-start-1 col-end-3">
                <My_form
                    setTokenOne={setToken1}
                    setTokenTwo={setToken2}
                    setAmountOne={setAmount1}
                    setAmountTwo={setAmount2}
                    tokenOne={token1}
                    tokenTwo={token2}
                    amountOne={amount1}
                    amountTwo={amount2}
                    setActive={setActive}
                />

                <div className="flex justify-center">
                    <button
                        className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-1 px-2 rounded m-3"
                        onClick={async function () {
                            swap(bestRateIndex)
                        }}
                    >
                        <p className="text-sm font-semibold">{bestRateIndex}</p>
                    </button>
                </div>
            </div>

            <ul class="bg-blue-50 col-start-3 col-end-5 flex flex-col justify-around items-center sm:flex sm:flex-col">
                <li className="sm:my-2 lg:my-0">
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
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 font-bold text-white py-1 px-2 rounded"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with uniswap")
                                } else {
                                    console.log("Enter Amount")
                                }
                            }}
                        >
                            <div>
                                {uniSwapPrice == "wait.." ? (
                                    <p className="text-sm font-semibold">
                                        Fetching Price from Uniswap...
                                    </p>
                                ) : uniSwapPrice <= 0 ? (
                                    <p className="text-sm font-semibold">
                                        {" "}
                                        Swap not Available on Uniswap
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold">
                                        {uniSwapPrice > 1
                                            ? Number(uniSwapPrice).toFixed(3)
                                            : Number(uniSwapPrice).toPrecision(3)}{" "}
                                        {swapType == 2 ? token1 : token2} for{" "}
                                        {uniswapInputUsedForPriceCalc > 1
                                            ? Number(uniswapInputUsedForPriceCalc).toFixed(3)
                                            : Number(uniswapInputUsedForPriceCalc).toPrecision(3)}
                                        {swapType == 2 ? token2 : token1} on UniSwap
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </li>
                <li className="sm:my-2 lg:my-0">
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
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 font-bold text-white py-1 px-2 rounded"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with sushiswap")
                                } else {
                                    console.log(`please enter amount`)
                                }
                            }}
                        >
                            <div>
                                {sushiSwapPrice == "wait.." ? (
                                    <p className="text-sm font-semibold">
                                        Fetching Price from SushiSwap...
                                    </p>
                                ) : sushiSwapPrice <= 0 ? (
                                    <p className="text-sm font-semibold">
                                        {" "}
                                        Swap not Available on SushiSwap
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold">
                                        {sushiSwapPrice > 1
                                            ? Number(sushiSwapPrice).toFixed(3)
                                            : Number(sushiSwapPrice).toPrecision(3)}{" "}
                                        {swapType == 2 ? token1 : token2} for{" "}
                                        {sushiswapInputUsedForPriceCalc > 1
                                            ? Number(sushiswapInputUsedForPriceCalc).toFixed(3)
                                            : Number(sushiswapInputUsedForPriceCalc).toPrecision(3)}
                                        {swapType == 2 ? token2 : token1} on SushiSwap
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </li>
                <li className="sm:my-2 lg:my-0">
                    {curveTxLoading == true ? (
                        <div class="rounded-md border-current bg-green-500 px-8 py-1 ">
                            <Loading
                                direction="right"
                                fontSize={15}
                                size={15}
                                spinnerType="loader"
                                text={curveTxLoadingText}
                                style={{
                                    padding: "20px 0 20px 0",
                                }}
                            />
                        </div>
                    ) : (
                        <button
                            disabled={curvestate}
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 font-bold text-white py-1 px-2 rounded"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with curve")
                                } else {
                                    console.log("please enter amount")
                                }
                            }}
                        >
                            <div>
                                {curveSwapPrice == "wait.." ? (
                                    <p className="text-sm font-semibold">
                                        Fetching Price from Curve...
                                    </p>
                                ) : curveSwapPrice <= 0 ? (
                                    <p className="text-sm font-semibold">
                                        Swap not Available on Curve
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold">
                                        {curveSwapPrice > 1
                                            ? Number(curveSwapPrice).toFixed(3)
                                            : Number(curveSwapPrice).toPrecision(3)}{" "}
                                        {swapType == 2 ? token1 : token2} for{" "}
                                        {curveInputUsedForPriceCalc > 1
                                            ? Number(curveInputUsedForPriceCalc).toFixed(3)
                                            : Number(curveInputUsedForPriceCalc).toPrecision(3)}
                                        {swapType == 2 ? token2 : token1} on Curve
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </li>
                <li className="sm:my-2 lg:my-0">
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
                            className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 font-bold text-white py-1 px-2 rounded"
                            onClick={async () => {
                                if (amount1 > 0) {
                                    swap("swap with balancer")
                                }
                            }}
                        >
                            <div>
                                {balancerPrice == "wait.." ? (
                                    <p className="text-sm font-semibold">
                                        Fetching Price from Balancer...
                                    </p>
                                ) : balancerPrice <= 0 ? (
                                    <p className="text-sm font-semibold">
                                        Swap not Available on Balancer
                                    </p>
                                ) : (
                                    <p className="text-sm font-semibold">
                                        Get{" "}
                                        {balancerPrice > 1
                                            ? Number(balancerPrice).toFixed(3)
                                            : Number(balancerPrice).toPrecision(3)}{" "}
                                        {swapType == 2 ? token1 : token2} for{" "}
                                        {balancerInputUsedForPriceCalc > 1
                                            ? Number(balancerInputUsedForPriceCalc).toFixed(3)
                                            : Number(balancerInputUsedForPriceCalc).toPrecision(3)}
                                        {swapType == 2 ? token2 : token1} on Balancer
                                    </p>
                                )}
                            </div>
                        </button>
                    )}
                </li>
            </ul>
        </div>
    )
}

const get = async (id) => {
    const Optionss = Options()
    const token = Optionss.find((Option) => Option.id == id)
    const contractAddress = token.address
    const decimal = token.decimals

    return [decimal, contractAddress]
}
