import { AlphaRouter } from "@uniswap/smart-order-router"
import { Token, CurrencyAmount, TradeType, Percent } from "@uniswap/sdk-core"
import { ethers, BigNumber } from "ethers"
import JSBI from "jsbi"
import ERC20ABI from "../constants/ERC20ABI.json"
import CurveABI from "../constants/curveABIs.json"
import SushiSwapABI from "../constants/sushiABIs.json"
import uniSwapABI from "../constants/uniSwapABI.json"
import vaultABI from "../constants/balancerABI.json"

const handleNotification = (type, tx, dispatch, message) => {
    if (type == "error" && tx == "approval") {
        dispatch({
            type: "error",
            message: message,
            title: "Approval error",
            position: "topR",
        })
    }

    if (type == "error" && tx == "swap") {
        dispatch({
            type: "error",
            message: message,
            title: "transaction error",
            position: "topR",
        })
    }

    if (type == "success" && tx == "swap") {
        dispatch({
            type: "success",
            message: "Transaction Successful",
            title: "Tx success",
            position: "topR",
        })
    }

    if (tx == "insufficient fund") {
        dispatch({
            type: "error",
            message: "Insufficent fund",
            title: "Insufficent fund",
            position: "topR",
        })
    }

    if (tx == "enableWeb3") {
        dispatch({
            type: "error",
            message: "Please! Connect to a wallet",
            title: "Not Connected",
            position: "topR",
        })
    }
}

const approve = async (tokenInputAddress, approvee, amount, setLoadingText) => {
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = web3Provider.getSigner()
    const contract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)

    if (
        tokenInputAddress == "0xdAC17F958D2ee523a2206206994597C13D831ec7" ||
        tokenInputAddress == "0xdac17f958d2ee523a2206206994597c13d831ec7"
    ) {
        setLoadingText("waiting for Approval")
        await contract.connect(signer).approve(approvee, 0)
        setLoadingText(`waiting for Approval`)
        await contract.connect(signer).approve(approvee, amount)
    } else {
        setLoadingText(`waiting for Approval`)
        await contract.connect(signer).approve(approvee, amount)
    }
}

export async function swapWithUniswap(
    amountUsedForCalc,
    amountCalculated,
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
) {
    setUniSwapTxLoading(true)
    try {
        if (isWeb3Enabled == false) {
            handleNotification("error", "enableWeb3", dispatch)
            throw "Not connected to a wallet"
        }
        const signer = web3Provider.getSigner()
        const receipient = await signer.getAddress()
        const deadline = Math.floor(Date.now() / 1000 + 1800)

        const Address = "0xE592427A0AEce92De3Edee1F18E0157C05861564"
        const ABI = uniSwapABI[Address]
        const Contract = new ethers.Contract(Address, ABI, web3Provider)

        const inputTokenContract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)
        const outputTokenContract = new ethers.Contract(tokenOutputAddress, ERC20ABI, web3Provider)
        const inputAmount1 = await inputTokenContract.balanceOf(receipient)
        const outputAmount1 = await outputTokenContract.balanceOf(receipient)
        if (swapType == 1) {
            const given = Number(amountUsedForCalc).toFixed(6)
            const givenAmount = ethers.utils.parseUnits(given.toString(), inputDecimal)
            const calculated = Number(amountCalculated).toFixed(6)
            const calculatedAmount = ethers.utils.parseUnits(calculated.toString(), outputDecimal)
            const minOutput = calculatedAmount.mul(BigNumber.from(100).sub(slippage)).div(100)

            if (Number(givenAmount) > Number(inputAmount1)) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                await approve(tokenInputAddress, Address, givenAmount, setUniSwapTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setUniSwapTxLoading(false)
                console.log(e)
                return
            }

            const params = {
                tokenIn: tokenInputAddress,
                tokenOut: tokenOutputAddress,
                fee: 3000,
                recipient: receipient,
                deadline: deadline,
                amountIn: givenAmount,
                amountOutMinimum: minOutput,
                sqrtPriceLimitX96: 0,
            }

            try {
                setUniSwapTxLoadingText(`Sign swap Transaction`)
                const tx = await Contract.connect(signer).exactInputSingle(params, {
                    gasLimit: 30000000,
                })
                setUniSwapTxLoadingText(`processing...`)
                await tx.wait()

                setUniSwapTxLoading(false)
                handleNotification("success", "swap", dispatch)
            } catch (e) {
                handleNotification("error", "swap", dispatch, e.message)
                setUniSwapTxLoading(false)
                console.log(e)
            }
        } else if (swapType == 2) {
            const given = Number(amountUsedForCalc).toFixed(6)
            const givenAmount = ethers.utils.parseUnits(given.toString(), outputDecimal)
            const calculated = Number(amountCalculated).toFixed(6)
            const calculatedAmount = ethers.utils.parseUnits(calculated.toString(), inputDecimal)
            const maxInput = calculatedAmount.mul(BigNumber.from(100).add(slippage)).div(100)

            if (Number(calculatedAmount) > Number(inputAmount1)) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                await approve(tokenInputAddress, Address, maxInput, setUniSwapTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setUniSwapTxLoading(false)
                console.log(e)
                return
            }

            const params = {
                tokenIn: tokenInputAddress,
                tokenOut: tokenOutputAddress,
                fee: 3000,
                recipient: receipient,
                deadline: deadline,
                amountOut: givenAmount,
                amountInMaximum: maxInput,
                sqrtPriceLimitX96: 0,
            }

            try {
                setUniSwapTxLoadingText(`Sign swap Transaction`)
                const tx = await Contract.connect(signer).exactOutputSingle(params, {
                    gasLimit: 30000000,
                })
                setUniSwapTxLoadingText(`processing...`)
                await tx.wait()

                setUniSwapTxLoading(false)
                handleNotification("success", "swap", dispatch)
            } catch (e) {
                handleNotification("error", "swap", dispatch, e.message)
                setUniSwapTxLoading(false)
                console.log(e)
            }
        }

        const inputAmount2 = await inputTokenContract.balanceOf(receipient)
        const outputAmount2 = await outputTokenContract.balanceOf(receipient)
        const amountReceived = outputAmount2 - outputAmount1
        const amountSent = inputAmount1 - inputAmount2
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setUniSwapTxLoading(false)
        console.log(e)
    }
}

export const swapWithCurve = async (
    inputAmount,
    inputDecimal,
    amountOut,
    outputDecimal,
    tokenInputAddress,
    tokenOutputAddress,
    swapType,
    isWeb3Enabled,
    slippage,
    web3Provider,
    dispatch,
    setCurveTxLoading,
    setCurveTxLoadingText
) => {
    setCurveTxLoading(true)
    try {
        if (isWeb3Enabled == false) {
            handleNotification("error", "enableWeb3", dispatch)
            throw "Not connected to a wallet"
        }
        const signer = web3Provider.getSigner()
        const receipient = await signer.getAddress()

        const Address = "0x99a58482BD75cbab83b27EC03CA68fF489b5788f"
        const ABI = CurveABI["Vyper"]
        const Contract = new ethers.Contract(Address, ABI, web3Provider)

        const input = Number(inputAmount).toFixed(6)
        const Amount1 = ethers.utils.parseUnits(input.toString(), inputDecimal)

        const output = Number(amountOut).toFixed(6)
        const AmountOut = ethers.utils.parseUnits(output.toString(), outputDecimal)

        const percentageSlippage = BigNumber.from(5)
        console.log(`expected Output = ${slippage.toString()}`)
        const expectedOutput = AmountOut.mul(BigNumber.from(100).sub(slippage)).div(100)
        // const expectedOutput = AmountOut.sub(percentageSlippage.mul(AmountOut.div(100)))
        console.log(`expected Output = ${AmountOut.toString()}`)
        if (swapType == 2) {
            dispatch({
                type: "error",
                message: "Exact Output not supported by curve",
                title: "Unsupported",
                position: "topR",
            })

            throw "Exact Output not Supported by curve"
        }

        const inputTokenContract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)
        const amount1Balance = await inputTokenContract.balanceOf(receipient)

        if (Number(Amount1) > Number(amount1Balance)) {
            handleNotification("error", "insufficient fund", dispatch)
            throw "Insufficient fund"
        }

        try {
            await approve(tokenInputAddress, Address, Amount1, setCurveTxLoadingText)
        } catch (e) {
            handleNotification("error", "approval", dispatch, e.message)
            setCurveTxLoading(false)
            console.log(e)
            return
        }
        try {
            setCurveTxLoadingText("sign swap transaction")
            const tx = await Contract.connect(signer).exchange_with_best_rate(
                tokenInputAddress,
                tokenOutputAddress,
                Amount1,
                0,
                {
                    gasLimit: 30000000,
                    gasPrice: 47189990884,
                }
            )
            setCurveTxLoadingText("processing...")

            await tx.wait()
            handleNotification("success", "swap", dispatch)
            setCurveTxLoading(false)
        } catch (e) {
            handleNotification("error", "swap", dispatch, e.message)
            setCurveTxLoading(false)
            console.log(e)
        }
    } catch (e) {
        setCurveTxLoading(false)
        console.log(e)
    }
}
export const swapWithSushi = async (
    token1,
    token2,
    amountUsedForCalc,
    amountCalculated,
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
) => {
    setSushiTxLoading(true)
    try {
        if (isWeb3Enabled == false) {
            handleNotification("error", "enableWeb3", dispatch)
            throw "Not connected to a wallet"
        }
        const signer = web3Provider.getSigner()

        const Address = "0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F"
        const ABI = SushiSwapABI[Address]
        const Contract = new ethers.Contract(Address, ABI, web3Provider)
        const receipient = await signer.getAddress()
        const deadline = Math.floor(Date.now() / 1000 + 1800)

        const inputTokenContract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)
        const outputTokenContract = new ethers.Contract(tokenOutputAddress, ERC20ABI, web3Provider)
        let inputAmount1
        token1 == "ETH"
            ? (inputAmount1 = await web3Provider.getBalance(receipient))
            : (inputAmount1 = await inputTokenContract.balanceOf(receipient))
        const outputAmount1 = await outputTokenContract.balanceOf(receipient)
        let tx
        if (swapType == 1) {
            const given = Number(amountUsedForCalc).toFixed(6)
            const givenAmount = ethers.utils.parseUnits(given.toString(), inputDecimal)
            const calculated = Number(amountCalculated).toFixed(6)
            const calculatedAmount = ethers.utils.parseUnits(calculated.toString(), outputDecimal)
            const minOutput = calculatedAmount.mul(BigNumber.from(100).sub(slippage)).div(100)

            if (Number(givenAmount) > Number(inputAmount1.toString())) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                if (token1 == "ETH") {
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapExactETHForTokens(
                        minOutput,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            value: givenAmount,
                            gasPrice: 91710994765,
                            gasLimit: 500000,
                        }
                    )
                    setSushiTxLoadingText("processing...")
                } else if (token2 == "ETH") {
                    try {
                        await approve(
                            tokenInputAddress,
                            Address,
                            givenAmount,
                            setSushiTxLoadingText
                        )
                    } catch (e) {
                        handleNotification("error", "approval", dispatch, e.message)
                        setSushiTxLoading(false)
                        console.log(e)
                        return
                    }
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapExactTokensForETH(
                        givenAmount,
                        minOutput,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            gasPrice: 11471623582,
                            gasLimit: 500000,
                        }
                    )
                    setSushiTxLoadingText("processing...")
                } else {
                    try {
                        await approve(
                            tokenInputAddress,
                            Address,
                            givenAmount,
                            setSushiTxLoadingText
                        )
                    } catch (e) {
                        handleNotification("error", "approval", dispatch, e.message)
                        setSushiTxLoading(false)
                        console.log(e)
                        return
                    }
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapExactTokensForTokens(
                        givenAmount,
                        minOutput,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            gasPrice: 11471623582,
                            gasLimit: 500000,
                        }
                    )
                }
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setSushiTxLoading(false)
                console.log(e)
            }
        } else if (swapType == 2) {
            const given = Number(amountUsedForCalc).toFixed(6)
            const givenAmount = ethers.utils.parseUnits(given.toString(), outputDecimal)
            const calculated = Number(amountCalculated).toFixed(6)
            const calculatedAmount = ethers.utils.parseUnits(calculated.toString(), inputDecimal)
            const maxInput = calculatedAmount.mul(BigNumber.from(100).add(slippage)).div(100)

            if (Number(calculatedAmount) > Number(inputAmount1.toString())) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                if (token1 == "ETH") {
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapETHForExactTokens(
                        givenAmount,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            value: maxInput,
                            gasPrice: 23099912615,
                            gasLimit: 500000,
                        }
                    )
                    setSushiTxLoadingText("processing...")
                } else if (token2 == "ETH") {
                    try {
                        await approve(tokenInputAddress, Address, maxInput, setSushiTxLoadingText)
                    } catch (e) {
                        handleNotification("error", "approval", dispatch, e.message)
                        setSushiTxLoading(false)
                        console.log(e)
                        return
                    }
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapTokensForExactETH(
                        givenAmount,
                        maxInput,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            gasPrice: 11471623582,
                            gasLimit: 500000,
                        }
                    )
                    setSushiTxLoadingText("processing...")
                } else {
                    try {
                        await approve(tokenInputAddress, Address, maxInput, setSushiTxLoadingText)
                    } catch (e) {
                        handleNotification("error", "approval", dispatch, e.message)
                        setSushiTxLoading(false)
                        console.log(e)
                        return
                    }
                    setSushiTxLoadingText("sign swap transaction")
                    tx = await Contract.connect(signer).swapTokensForExactTokens(
                        givenAmount,
                        maxInput,
                        [tokenInputAddress, tokenOutputAddress],
                        receipient,
                        deadline,
                        {
                            gasPrice: 11471623582,
                            gasLimit: 500000,
                        }
                    )
                }
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setSushiTxLoading(false)
                console.log(e)
            }
        }

        setSushiTxLoadingText("processing...")
        await tx.wait(1)

        handleNotification("success", "swap", dispatch)
        setSushiTxLoading(false)
        const inputAmount2 = await inputTokenContract.balanceOf(receipient)
        const outputAmount2 = await outputTokenContract.balanceOf(receipient)
        const amountReceived = outputAmount2 - outputAmount1
        const amountSent = inputAmount1 - inputAmount2
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setSushiTxLoading(false)
        console.log(e)
    }
}

export const swapWithBalancer = async (
    swaps,
    checksum_tokens,
    tokenLimits,
    swapType,
    slippage,
    isWeb3Enabled,
    web3Provider,
    dispatch,
    setBalancerTxLoading,
    setBalancerTxLoadingText
) => {
    setBalancerTxLoading(true)
    try {
        if (isWeb3Enabled == false) {
            handleNotification("error", "enableWeb3", dispatch)
            throw "Not connected to a wallet"
        }
        const signer = web3Provider.getSigner()
        const swapper = await signer.getAddress()
        const fund_struct = {
            sender: swapper,
            fromInternalBalance: false,
            recipient: swapper,
            toInternalBalance: false,
        }
        const deadline = Math.floor(Date.now() / 1000 + 1800)
        const vaultAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8"
        const vaultContract = new ethers.Contract(vaultAddress, vaultABI, web3Provider)
        const limits = [...tokenLimits]
        const indexOfReturnedValue = limits.findIndex((limit) => limit < 0)

        const inputTokenContract = new ethers.Contract(checksum_tokens[0], ERC20ABI, web3Provider)
        const outputTokenContract = new ethers.Contract(
            checksum_tokens[indexOfReturnedValue],
            ERC20ABI,
            web3Provider
        )
        const inputAmount1 = await inputTokenContract.balanceOf(swapper)
        const outputAmount1 = await outputTokenContract.balanceOf(swapper)

        if (swapType == 1) {
            const amountOut = limits[indexOfReturnedValue]
                .mul(BigNumber.from(100).sub(slippage))
                .div(100)
            limits[indexOfReturnedValue] = amountOut

            if (Number(tokenLimits[0]) > Number(inputAmount1.toString())) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                await approve(
                    checksum_tokens[0],
                    vaultAddress,
                    tokenLimits[0],
                    setBalancerTxLoadingText
                )
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setBalancerTxLoading(false)
                console.log(e)
                return
            }

            try {
                setBalancerTxLoadingText("sign swap transaction")
                const batch_swap_function = await vaultContract
                    .connect(signer)
                    .batchSwap(0, swaps, checksum_tokens, fund_struct, limits, deadline, {
                        gasLimit: 30000000,
                    })
                setBalancerTxLoadingText("processing...")
                await batch_swap_function.wait()

                handleNotification("success", "swap", dispatch)
                setBalancerTxLoading(false)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                console.log(e)
                setBalancerTxLoading(false)
            }
        } else if (swapType == 2) {
            const amountIn = limits[0].mul(BigNumber.from(100).add(slippage)).div(100)
            limits[0] = amountIn

            if (Number(limits[0]) > Number(inputAmount1)) {
                handleNotification("error", "insufficient fund", dispatch)
                throw "Insufficient fund"
            }

            try {
                await approve(checksum_tokens[0], vaultAddress, amountIn, setBalancerTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setBalancerTxLoading(false)
                console.log(e)
                return
            }

            try {
                setBalancerTxLoadingText("sign swap transaction")
                const batch_swap_function = await vaultContract
                    .connect(signer)
                    .batchSwap(1, swaps, checksum_tokens, fund_struct, limits, deadline, {
                        gasLimit: 30000000,
                    })
                setBalancerTxLoadingText("processing...")
                await batch_swap_function.wait()

                handleNotification("success", "swap", dispatch)
                setBalancerTxLoading(false)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                console.log(e)
                setBalancerTxLoading(false)
            }
        }

        const inputAmount2 = await inputTokenContract.balanceOf(swapper)
        const outputAmount2 = await outputTokenContract.balanceOf(swapper)
        const amountReceived = outputAmount2 - outputAmount1
        const amountSent = inputAmount1 - inputAmount2
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setBalancerTxLoading(false)
        console.log(e.message)
    }
}

// export async function Swap() {
//     async function SwapwithAutoRouter() {
//         console.log("start")
//         const V3_SWAP_ROUTER_ADDRESS = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45"
//         const account = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

//         const ChainId = 1
//         const router = new AlphaRouter({ chainId: ChainId, provider: web3Provider })
//         const address0 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
//         const decimal0 = 18
//         const symbol0 = "WETH"
//         const name0 = "Wrapped Ether"

//         const address1 = "0x6b175474e89094c44da98b954eedeac495271d0f"
//         const decimal1 = 18
//         const symbol1 = "DAI"
//         const name1 = "DAI StableCoin"

//         const DAI = new Token(ChainId, address1, decimal1, symbol1, name1)
//         const WETH = new Token(ChainId, address0, decimal0, symbol0, name0)
//         const typedValueParsed = ethers.utils.parseEther("0.01", 18)
//         const wethAmount = CurrencyAmount.fromRawAmount(DAI, JSBI.BigInt(typedValueParsed))

//         console.log("getting router")
//         const route = await router.route(wethAmount, WETH, TradeType.EXACT_INPUT, {
//             type: 1,
//             recipient: account,
//             slippageTolerance: new Percent(25, 100),
//             deadline: Math.floor(Date.now() / 1000 + 1800),
//         })
//         console.log("signing..")
//         const transaction = {
//             data: route.methodParameters.calldata,
//             to: V3_SWAP_ROUTER_ADDRESS,
//             value: BigNumber.from(route.methodParameters.value),
//             from: account,
//             gasPrice: BigNumber.from(route.gasPriceWei),
//         }

//         const signer = web3Provider.getSigner()
//         const approvalAmount = ethers.utils.parseUnits("0.01", 18).toString()
//         const contract0 = new ethers.Contract(address1, ERC20ABI, web3Provider)
//         await contract0.connect(signer).approve(V3_SWAP_ROUTER_ADDRESS, approvalAmount)
//         console.log("sending ....")

//         console.log(route)
//         console.log("done")
//     }
// }
