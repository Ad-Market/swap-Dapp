import { SOR, SwapTypes } from "@balancer-labs/sor"
import { useMoralis } from "react-moralis"
import { CoingeckoTokenPriceService } from "../Utils/coingeckoTokenPriceService"
import { SubgraphPoolDataService } from "../Utils/subgraphDataProvider"
import { ethers } from "ethers"
import ABI from "../constants/balancerABI.json"
import { useEffect, useState } from "react"
import { Loading, useNotification } from "@web3uikit/core"
import { swapWithBalancer } from "../Utils/swapFunctions"

export const GetBalancerPrice = ({
    token1,
    token2,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    inputDecimal,
    outputDecimal,
    swapType,
    slippage,
    setBalancerSwapPrice,
    provider,
    setBalancerButton,
}) => {
    const { isWeb3Enabled, enableWeb3 } = useMoralis()
    const [price, setPrice] = useState()
    const [swaps, setSwaps] = useState()
    const [addresses, setAddresses] = useState()
    const [tokenLimits, setTokenLimits] = useState()
    const [isFetching, setIsFetching] = useState(false)
    const [state, setState] = useState()
    const [priceUsedForCalc, setPriceUsedForCalc] = useState()
    const [tokenInputUsed, setTokenInputUsed] = useState()
    const [tokenOutputUsed, setTokenOutputUsed] = useState()
    const [balancerTxLoading, setBalancerTxLoading] = useState(false)
    const [balancerTxLoadingText, setBalancerTxLoadingText] = useState("")
    const dispatch = useNotification()
    useEffect(() => {
        setBalancerButton(document.getElementById("balancerButton"))
    })

    const subgraphPoolDataService = new SubgraphPoolDataService({
        subgraphUrl: "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2-beta",
    })
    const coingeckoTokenPriceService = new CoingeckoTokenPriceService(1)
    const SOR_Config = {
        chainId: 1,
        vault: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
        weth: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        wETHwstETH: {
            id: "0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080",
            address: "0x32296969ef14eb0c6d29669c550d4a0449130230",
        },
    }
    let sor
    const swapper = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    const fund_struct = {
        sender: swapper,
        fromInternalBalance: false,
        recipient: swapper,
        toInternalBalance: false,
    }

    const swap = () => {
        swapWithBalancer(
            swaps,
            addresses,
            tokenLimits,
            swapType,
            slippage,
            isWeb3Enabled,
            provider,
            dispatch,
            setBalancerTxLoading,
            setBalancerTxLoadingText
        )
    }
    let Amount, swaptype
    if (swapType == 1) {
        input == 0 || input == undefined
            ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
            : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))
        swaptype = SwapTypes.SwapExactIn
    } else if (swapType == 2) {
        output == 0 || output == undefined
            ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
            : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))
        swaptype = SwapTypes.SwapExactOut
    }
    const Address = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
    const getPrice = async () => {
        setIsFetching(true)
        try {
            setTokenInputUsed(tokenInputAddress)
            setTokenOutputUsed(tokenOutputAddress)
            sor = new SOR(provider, SOR_Config, subgraphPoolDataService, coingeckoTokenPriceService)
            await sor.fetchPools()
            const swap = await sor.getSwaps(tokenInputAddress, tokenOutputAddress, swaptype, Amount)
            const Contract = new ethers.Contract(Address, ABI, provider)
            const tx = await Contract.callStatic.queryBatchSwap(
                swaptype,
                swap.swaps,
                swap.tokenAddresses,
                fund_struct
            )
            swapType == 1
                ? setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                : setPriceUsedForCalc(Number(output) > 0 ? output : "1")

            setSwaps(swap.swaps)
            setAddresses(swap.tokenAddresses)
            setTokenLimits(tx)
            setIsFetching(false)
            handle(tx)
        } catch (e) {
            setSwaps([])
            setAddresses([])
            setTokenLimits([])
            setPrice("0.00")
            setIsFetching(false)
            swapType == 1
                ? setPriceUsedForCalc(Number(input) > 0 ? input : "1")
                : setPriceUsedForCalc(Number(output) > 0 ? output : "1")
            setTokenInputUsed(tokenInputAddress)
            setTokenOutputUsed(tokenOutputAddress)
            console.log(e)
        }
    }

    const handle = (tx) => {
        const decimal = swapType == 1 ? outputDecimal : inputDecimal
        const Asset =
            swapType == 1
                ? tx.find((assetdellta) => assetdellta < 0)
                : tx.find((assetdellta) => assetdellta > 0)
        const result = ethers.utils.formatUnits(Asset.toString(), decimal)
        const price = Number(result) > 1 ? Number(result).toFixed(3) : Number(result).toPrecision(3)
        setPrice(Math.abs(price))
    }

    useEffect(() => {
        setBalancerSwapPrice(price)
    }, [price])

    useEffect(() => {
        if (isFetching == true || price <= 0) {
            setState(true)
            setBalancerSwapPrice(0)
        } else {
            setState(false)
        }
        console.log(isFetching)
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
                    disabled={state}
                    className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                    id="balancerButton"
                    onClick={async () => {
                        if (input > 0) {
                            swap()
                        }
                    }}
                >
                    <div>
                        {isFetching ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Fetching Price from Balancer...
                            </p>
                        ) : price <= 0 ? (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Swap not Available on Balancer
                            </p>
                        ) : (
                            <p className="text-zinc-100 font-semibold text-sm">
                                Get {swapType == 2 ? priceUsedForCalc : price} {""} {token2} for{" "}
                                {swapType == 2 ? price : priceUsedForCalc} {token1} on Balancer
                            </p>
                        )}
                    </div>
                </button>
            )}
        </div>
    )
}
