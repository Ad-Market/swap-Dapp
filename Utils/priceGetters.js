import CurveABI from "../constants/curveABIs.json"
import uniSwapABI from "../constants/uniSwapABI.json"
import SushiSwapABI from "../constants/sushiABIs.json"
import { ethers } from "ethers"
import { SOR, SwapTypes } from "@balancer-labs/sor"
import { SubgraphPoolDataService } from "./subgraphDataProvider"
import { CoingeckoTokenPriceService } from "./coingeckoTokenPriceService"
import vaultABI from "../constants/balancerABI.json"

export const getCurvePrice = async (
    web3Provider,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    outputDecimal,
    inputDecimal,
    swapType,
    setCurevSwapFunc,
    setInputUsed
) => {
    setCurevSwapFunc("wait..")

    const Address = "0x99a58482BD75cbab83b27EC03CA68fF489b5788f"
    const ABI = CurveABI["Vyper"]
    const Contract = new ethers.Contract(Address, ABI, web3Provider)
    let Amount
    try {
        if (swapType == 1) {
            input == 0 || input == undefined
                ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
                : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))

            const result = await Contract.get_best_rate(
                tokenInputAddress,
                tokenOutputAddress,
                Amount
            )
            const price = ethers.utils.formatUnits(result[1].toString(), outputDecimal)
            setCurevSwapFunc(price.toString())
            input == undefined || input == "" ? setInputUsed("1") : setInputUsed(input)
        } else if (swapType == 2) {
            output == 0 || output == undefined
                ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
                : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))
            const result = await Contract.get_best_rate(
                tokenOutputAddress,
                tokenInputAddress,
                Amount
            )
            const price = ethers.utils.formatUnits(result[1].toString(), inputDecimal)
            setCurevSwapFunc(price.toString())
            output == undefined || output == "" ? setInputUsed("1") : setInputUsed(output)
        }
    } catch (e) {
        console.log(e)
        setCurevSwapFunc("0.00")
        if (!e.message.toLowerCase().includes("Cannot read properties of null".toLowerCase())) {
            swapType == 2
                ? output == undefined || output == ""
                    ? setInputUsed("1")
                    : setInputUsed(output)
                : input == undefined || input == ""
                ? setInputUsed("1")
                : setInputUsed(input)
        }
    }
}

export const getUniswapPrice = async (
    web3Provider,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    outputDecimal,
    inputDecimal,
    swapType,
    setUniSwapFunc,
    setInputUsed
) => {
    setUniSwapFunc("wait..")
    const Address = "0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6"
    const ABI = uniSwapABI[Address]
    const Contract = new ethers.Contract(Address, ABI, web3Provider)
    let Amount
    try {
        if (swapType == 1) {
            input == 0 || input == undefined
                ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
                : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))

            const result = await Contract.callStatic.quoteExactInputSingle(
                tokenInputAddress,
                tokenOutputAddress,
                3000,
                Amount.toString(),
                0
            )
            const price = ethers.utils.formatUnits(result.toString(), outputDecimal)
            setUniSwapFunc(price.toString())

            input == undefined || input == "" ? setInputUsed("1") : setInputUsed(input)
        } else if (swapType == 2) {
            output == 0 || output == undefined
                ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
                : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))
            const result = await Contract.callStatic.quoteExactOutputSingle(
                tokenInputAddress,
                tokenOutputAddress,
                3000,
                Amount.toString(),
                0
            )
            const price = ethers.utils.formatUnits(result.toString(), inputDecimal)
            setUniSwapFunc(price.toString())
            output == undefined || output == "" ? setInputUsed("1") : setInputUsed(output)
        }
    } catch (error) {
        setUniSwapFunc("0.0")
        console.log(`UNI Error ${error}`)
        if (!error.message.toLowerCase().includes("Cannot read properties of null".toLowerCase())) {
            swapType == 2
                ? output == undefined || output == ""
                    ? setInputUsed("1")
                    : setInputUsed(output)
                : input == undefined || input == ""
                ? setInputUsed("1")
                : setInputUsed(input)
        }
    }
}

export const getSushiSwapPrice = async (
    web3Provider,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    outputDecimal,
    inputDecimal,
    swapType,
    setSushiSwapPriceFunc,
    setInputUsed
) => {
    setSushiSwapPriceFunc("wait..")
    try {
        const routerAddress = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
        const routerABI = SushiSwapABI[routerAddress]
        const routerContract = new ethers.Contract(routerAddress, routerABI, web3Provider)
        let Amount
        if (swapType == 1) {
            input == 0 || input == undefined
                ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
                : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))
            const result = await routerContract.getAmountsOut(Amount, [
                tokenInputAddress,
                tokenOutputAddress,
            ])
            const price = ethers.utils.formatUnits(result[1].toString(), outputDecimal)
            setSushiSwapPriceFunc(price)
            input == undefined || input == "" ? setInputUsed("1") : setInputUsed(input)
        } else if (swapType == 2) {
            output == 0 || output == undefined
                ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
                : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))
            const result = await routerContract.getAmountsIn(Amount, [
                tokenInputAddress,
                tokenOutputAddress,
            ])
            const price = ethers.utils.formatUnits(result[0].toString(), inputDecimal)
            setSushiSwapPriceFunc(price)
            output == undefined || output == "" ? setInputUsed("1") : setInputUsed(output)
        }
    } catch (error) {
        setSushiSwapPriceFunc("0.0")
        console.log(`sushi Error ${error.message}`)
        if (!error.message.toLowerCase().includes("Cannot read properties of null".toLowerCase())) {
            swapType == 2
                ? output == undefined || output == ""
                    ? setInputUsed("1")
                    : setInputUsed(output)
                : input == undefined || input == ""
                ? setInputUsed("1")
                : setInputUsed(input)
        }
    }
}

export const getBalancerPrice = async (
    web3Provider,
    input,
    output,
    tokenInputAddress,
    tokenOutputAddress,
    outputDecimal,
    inputDecimal,
    swapType,
    setBalancerSwapPriceFunc,
    setBalancerSwaps,
    setBalancerAddresses,
    setBalancerTokenLimits,
    setInputUsed
) => {
    setBalancerSwapPriceFunc("wait..")

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
    const vaultAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
    const vaultContract = new ethers.Contract(vaultAddress, vaultABI, web3Provider)
    try {
        const sor = new SOR(
            web3Provider,
            SOR_Config,
            subgraphPoolDataService,
            coingeckoTokenPriceService
        )

        await sor.fetchPools()
        const swapper = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

        const fund_struct = {
            sender: swapper,
            fromInternalBalance: false,
            recipient: swapper,
            toInternalBalance: false,
        }
        let Amount
        if (swapType == 1) {
            input == 0 || input == undefined
                ? (Amount = ethers.utils.parseUnits("1", inputDecimal))
                : (Amount = ethers.utils.parseUnits(input.toString(), inputDecimal))

            const swap = await sor.getSwaps(
                tokenInputAddress,
                tokenOutputAddress,
                SwapTypes.SwapExactIn,
                Amount
            )
            const batch_swap_function = await vaultContract.callStatic.queryBatchSwap(
                0,
                swap.swaps,
                swap.tokenAddresses,
                fund_struct
            )

            if (batch_swap_function.length != 0) {
                const Asset = batch_swap_function.find((assetdellta) => assetdellta < 0)
                const price = ethers.utils.formatUnits(Asset.toString(), outputDecimal)
                setBalancerSwapPriceFunc(Math.abs(price))
                setBalancerSwaps(swap.swaps)
                setBalancerAddresses(swap.tokenAddresses)
                console.log(batch_swap_function[0].toString())
                input == undefined || input == "" ? setInputUsed("1") : setInputUsed(input)
                setBalancerTokenLimits(batch_swap_function)
                console.log(`exact input price Balancer = ${price.toString()}`)
                console.log("balancer price gotten successfully")
            } else {
                setBalancerSwapPriceFunc("0.00")
                input == undefined || input == "" ? setInputUsed("1") : setInputUsed(input)
                console.log("cant find balancer price")
            }
        } else if (swapType == 2) {
            output == 0 || output == undefined
                ? (Amount = ethers.utils.parseUnits("1", outputDecimal))
                : (Amount = ethers.utils.parseUnits(output.toString(), outputDecimal))

            const swap = await sor.getSwaps(
                tokenInputAddress,
                tokenOutputAddress,
                SwapTypes.SwapExactOut,
                Amount
            )

            const batch_swap_function = await vaultContract.callStatic.queryBatchSwap(
                1,
                swap.swaps,
                swap.tokenAddresses,
                fund_struct
            )

            if (batch_swap_function.length != 0) {
                const Asset = batch_swap_function.find((assetdellta) => assetdellta > 0)
                console.log(batch_swap_function[0].toString())
                const price = ethers.utils.formatUnits(Asset.toString(), inputDecimal)
                setBalancerSwapPriceFunc(Math.abs(price))
                setBalancerSwaps(swap.swaps)
                setBalancerAddresses(swap.tokenAddresses)
                output == undefined || output == "" ? setInputUsed("1") : setInputUsed(output)
                setBalancerTokenLimits(batch_swap_function)
                console.log(`exact output price Balancer = ${price.toString()}`)
                console.log("balancer price gotten successfully")
            } else {
                setBalancerSwapPriceFunc("0.00")
                output == undefined || output == "" ? setInputUsed("1") : setInputUsed(output)
                console.log("cant find balancer price")
            }
        }
    } catch (error) {
        setBalancerSwapPriceFunc("0.00")
        setBalancerSwaps([])
        setBalancerAddresses([])
        setBalancerTokenLimits([])
        console.log(error)
    }
}
