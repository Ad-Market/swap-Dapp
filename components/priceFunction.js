import { useState, useEffect } from "react"
import Options from "../Utils/listOfTokenAddresses"
import { useMoralis } from "react-moralis"
import { ethers } from "ethers"
import { Select } from "../components/select"

import { GetCurvePrice } from "./curvePriceGetter"
import { GetSushiSwapPrice } from "./sushiSwapPriceGetter"
import { GetBalancerPrice } from "./balancerPriceGetter"
import { GetUniswapPrice } from "./uniswapPriceGetter"
import { ThePage } from "./thePage"
import { SetSlippage } from "./setSlippage"

export default function PriceFunctions() {
    const { isWeb3Enabled, enableWeb3 } = useMoralis()
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

    const [bestRateIndex, setBestRateIndex] = useState()
    const [swapType, setSwapType] = useState(1)
    const [web3Provider, setWeb3Provider] = useState()
    const [showModal, setShowModal] = useState(false)
    const [showSlippageModal, setShowSlippageModal] = useState(false)
    const [slippage, setSlippage] = useState(5)
    const [tokenNum, setTokenNum] = useState()

    const [sushiButton, setSushiButton] = useState()
    const [balancerButton, setBalancerButton] = useState()
    const [curveButton, setCurveButton] = useState()
    const [uniswapButton, setUniswapButton] = useState()

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

    useEffect(() => {
        AddressandDecimal(token1, token2)
    }, [token2, token1])

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
            setBestRate(bestrate)
            setAmount2(bestRate)
        } else if (swapType == 2) {
            const bestrate = Math.min.apply(
                null,
                rates.filter((rate) => rate > 0)
            )
            setBestRate(bestrate)
            setAmount1(bestRate)
        }
    }, [uniSwapPrice, sushiSwapPrice, curveSwapPrice, balancerPrice])

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
            console.log(`uniswap`)
        } else if (indexOfBestRate == 1) {
            sushiButton.click()
            console.log(`sushiswap`)
        } else if (indexOfBestRate == 2) {
            curveButton.click()
            console.log(`curve`)
        } else if (indexOfBestRate == 3) {
            balancerButton.click()
            console.log(`balancer`)
        } else {
            console.log("-------")
        }
    }

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
        <div class=" bg-slate-400 h-full flex flex-col items-center py-6">
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
                <div className="m-2 w-full">
                    <GetUniswapPrice
                        token1={token1}
                        token2={token2}
                        tokenInputAddress={tokenInputAddress}
                        tokenOutputAddress={tokenOutputAddress}
                        input={amount1}
                        output={amount2}
                        inputDecimal={inputDecimal}
                        outputDecimal={outputDecimal}
                        swapType={swapType}
                        provider={web3Provider}
                        slippage={slippage}
                        setUniSwapPrice={setUniSwapPrice}
                        setUniswapButton={setUniswapButton}
                    />
                </div>
                <div className="m-2 w-full">
                    <GetSushiSwapPrice
                        token1={token1}
                        token2={token2}
                        input={amount1}
                        output={amount2}
                        tokenInputAddress={tokenInputAddress}
                        tokenOutputAddress={tokenOutputAddress}
                        outputDecimal={outputDecimal}
                        inputDecimal={inputDecimal}
                        swapType={swapType}
                        slippage={slippage}
                        provider={web3Provider}
                        setSushiSwapPrice={setSushiSwapPrice}
                        setSushiButton={setSushiButton}
                    />
                </div>
                <div className="m-2 w-full">
                    <GetCurvePrice
                        token1={token1}
                        token2={token2}
                        tokenInputAddress={tokenInputAddress}
                        tokenOutputAddress={tokenOutputAddress}
                        input={amount1}
                        output={amount2}
                        swapType={swapType}
                        inputDecimal={inputDecimal}
                        outputDecimal={outputDecimal}
                        provider={web3Provider}
                        slippage={slippage}
                        setCurveSwapPrice={setCurveSwapPrice}
                        setCurveButton={setCurveButton}
                    />
                </div>
                <div className="m-2 w-full">
                    <GetBalancerPrice
                        token1={token1}
                        token2={token2}
                        input={amount1}
                        output={amount2}
                        inputDecimal={inputDecimal}
                        outputDecimal={outputDecimal}
                        tokenInputAddress={tokenInputAddress}
                        tokenOutputAddress={tokenOutputAddress}
                        swapType={swapType}
                        slippage={slippage}
                        provider={web3Provider}
                        setBalancerSwapPrice={setBalancerPrice}
                        setBalancerButton={setBalancerButton}
                    />
                </div>
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
                />
            </div>
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
