import { ethers } from "ethers"
import ERC20ABI from "../constants/ERC20ABI.json"
import AddressFile from "../constants/swapAddress.json"
import ABI from "../constants/swapABI.json"

const Address = AddressFile["Contract_Address"]
const ethAddress = "0x0000000000000000000000000000000000000123"
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

const getBalances = async (tokenInputAddress, tokenOutputAddress, web3Provider, receipient) => {
    let outputTokenContract, inputTokenContract, inputAmount, outputAmount
    if (tokenInputAddress == ethAddress && tokenOutputAddress != ethAddress) {
        outputTokenContract = new ethers.Contract(tokenOutputAddress, ERC20ABI, web3Provider)
        inputAmount = await await web3Provider.getBalance(receipient)
        outputAmount = await outputTokenContract.balanceOf(receipient)
    } else if (tokenOutputAddress == ethAddress && tokenInputAddress != ethAddress) {
        inputTokenContract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)
        inputAmount = await inputTokenContract.balanceOf(receipient)
        outputAmount = await web3Provider.getBalance(receipient)
    } else {
        outputTokenContract = new ethers.Contract(tokenOutputAddress, ERC20ABI, web3Provider)
        inputTokenContract = new ethers.Contract(tokenInputAddress, ERC20ABI, web3Provider)
        inputAmount = await inputTokenContract.balanceOf(receipient)
        outputAmount = await outputTokenContract.balanceOf(receipient)
    }
    return [inputAmount.toString(), outputAmount.toString()]
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
        const Contract = new ethers.Contract(Address, ABI, web3Provider)

        const givenDecimal = swapType == 1 ? inputDecimal : outputDecimal
        const calculatedDecimal = swapType == 1 ? outputDecimal : inputDecimal
        const givenAmount = ethers.utils.parseUnits(
            Number(amountUsedForCalc).toFixed(6).toString(),
            givenDecimal
        )
        const calculatedAmount = ethers.utils.parseUnits(
            Number(amountCalculated).toFixed(6).toString(),
            calculatedDecimal
        )
        let Input, Output, inputAmount1
        swapType == 1 ? (Input = givenAmount) : (Input = calculatedAmount)
        swapType == 1 ? (Output = calculatedAmount) : (Output = givenAmount)
        const balances1 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )

        const approvalAmount = await Contract.approvalAmountRequired(Input, swapType, slippage)
        if (Number(approvalAmount) > Number(balances1[0])) {
            handleNotification("error", "insufficient fund", dispatch)
            throw "Insufficient fund"
        }
        if (tokenInputAddress != ethAddress) {
            try {
                await approve(tokenInputAddress, Address, approvalAmount, setUniSwapTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setUniSwapTxLoading(false)
                console.log(e)
                return
            }
        }

        const Value = tokenInputAddress == ethAddress ? approvalAmount : 0
        try {
            setUniSwapTxLoadingText("sign swap transaction")
            const Uniswap = await Contract.connect(signer).Uniswap(
                tokenInputAddress,
                tokenOutputAddress,
                3000,
                Input,
                Output,
                swapType,
                slippage,
                { value: Value }
            )
            await Uniswap.wait()
            setUniSwapTxLoading(false)
            handleNotification("success", "swap", dispatch)
        } catch (e) {
            setUniSwapTxLoading(false)
            handleNotification("error", "swap", dispatch, e.message)
        }

        const balances2 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )
        const amountReceived = balances2[1] - balances1[1]
        const amountSent = balances1[0] - balances2[0]
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setUniSwapTxLoading(false)
        console.log(e.message)
    }
}

export const swapWithCurve = async (
    inputAmount,
    inputDecimal,
    outputAmount,
    outputDecimal,
    tokenInputAddress,
    tokenOutputAddress,
    poolAddress,
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
        if (swapType == 2) {
            dispatch({
                type: "error",
                message: "Exact Output not supported by curve",
                title: "Unsupported",
                position: "topR",
            })

            throw "Exact Output not Supported by curve"
        }
        const signer = web3Provider.getSigner()
        const receipient = await signer.getAddress()
        const balances1 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )
        const amountIn = ethers.utils.parseUnits(
            Number(inputAmount).toFixed(6).toString(),
            inputDecimal
        )
        const amountOut = ethers.utils.parseUnits(
            Number(outputAmount).toFixed(6).toString(),
            outputDecimal
        )
        const Contract = new ethers.Contract(Address, ABI, web3Provider)
        const approvalAmount = await Contract.approvalAmountRequired(amountIn, swapType, slippage)
        if (Number(balances1[0]) < Number(approvalAmount)) {
            handleNotification("error", "insufficient fund", dispatch)
            throw "Insufficient fund"
        }

        if (tokenInputAddress != ethAddress) {
            try {
                await approve(tokenInputAddress, Address, approvalAmount, setCurveTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setCurveTxLoading(false)
                console.log(e)
                return
            }
        }
        const Value = tokenInputAddress == ethAddress ? approvalAmount : 0
        try {
            setCurveTxLoadingText("sign swap transaction")
            const curve = await Contract.connect(signer).swapWithCurve(
                tokenInputAddress,
                tokenOutputAddress,
                poolAddress,
                amountIn,
                amountOut,
                slippage,
                { value: Value }
            )
            setCurveTxLoadingText("processing...")
            await curve.wait()
            setCurveTxLoading(false)
            handleNotification("success", "swap", dispatch)
        } catch (e) {
            setCurveTxLoading(false)

            handleNotification("error", "swap", dispatch, e.message)
        }

        const balances2 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )

        const amountReceived = balances2[1] - balances1[1]
        const amountSent = balances1[0] - balances2[0]
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setCurveTxLoading(false)
        console.log(e)
    }
}
export const swapWithSushi = async (
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
        const receipient = await signer.getAddress()
        const Contract = new ethers.Contract(Address, ABI, web3Provider)

        const givenDecimal = swapType == 1 ? inputDecimal : outputDecimal
        const calculatedDecimal = swapType == 1 ? outputDecimal : inputDecimal
        const givenAmount = ethers.utils.parseUnits(
            Number(amountUsedForCalc).toFixed(6).toString(),
            givenDecimal
        )
        const calculatedAmount = ethers.utils.parseUnits(
            Number(amountCalculated).toFixed(6).toString(),
            calculatedDecimal
        )
        let Input, Output
        swapType == 1 ? (Input = givenAmount) : (Input = calculatedAmount)
        swapType == 1 ? (Output = calculatedAmount) : (Output = givenAmount)
        const approvalAmount = await Contract.approvalAmountRequired(Input, swapType, slippage)
        const balances1 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )
        if (Number(approvalAmount) > Number(balances1[0])) {
            handleNotification("error", "insufficient fund", dispatch)
            throw "Insufficient fund"
        }

        if (tokenInputAddress != ethAddress) {
            try {
                await approve(tokenInputAddress, Address, approvalAmount, setSushiTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setSushiTxLoading(false)
                console.log(e)
                return
            }
        }
        const Value = tokenInputAddress == ethAddress ? approvalAmount : 0
        try {
            setSushiTxLoadingText("sign swap transaction")
            const sushiSwap = await Contract.connect(signer).swapWithSushi(
                tokenInputAddress,
                tokenOutputAddress,
                Input,
                Output,
                slippage,
                swapType,
                { value: Value }
            )
            setSushiTxLoadingText("processing...")
            await sushiSwap.wait(1)
            setSushiTxLoading(false)
            handleNotification("success", "swap", dispatch)
        } catch (e) {
            setSushiTxLoading(false)
            handleNotification("error", "swap", dispatch, e.message)
        }

        const balances2 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )
        const amountReceived = balances2[1] - balances1[1]
        const amountSent = balances1[0] - balances2[0]
        console.log(`amount recieved is ${amountReceived}`)
        console.log(`amount sent is ${amountSent}`)
    } catch (e) {
        setSushiTxLoading(false)
        console.log(e)
    }
}

export const swapWithBalancer = async (
    tokenInputAddress,
    tokenOutputAddress,
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
        const receipient = await signer.getAddress()
        const balances1 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )

        const Contract = new ethers.Contract(Address, ABI, web3Provider)
        const approvalAmount = await Contract.approvalAmountRequired(
            tokenLimits[0],
            swapType,
            slippage
        )
        if (Number(approvalAmount) > Number(balances1[0])) {
            handleNotification("error", "insufficient fund", dispatch)
            throw "Insufficient fund"
        }
        if (tokenInputAddress != ethAddress) {
            try {
                await approve(tokenInputAddress, Address, approvalAmount, setBalancerTxLoadingText)
            } catch (e) {
                handleNotification("error", "approval", dispatch, e.message)
                setBalancerTxLoading(false)
                console.log(e)
                return
            }
        }

        const Value = tokenInputAddress == ethAddress ? approvalAmount : 0
        try {
            setBalancerTxLoadingText("sign swap transaction")
            const balancer = await Contract.connect(signer).swapWithBalancer(
                tokenInputAddress,
                tokenOutputAddress,
                swaps,
                checksum_tokens,
                tokenLimits,
                slippage,
                swapType,
                { value: Value }
            )
            setBalancerTxLoadingText("processing...")
            await balancer.wait(1)
            setBalancerTxLoading(false)
            handleNotification("success", "swap", dispatch)
        } catch (e) {
            setBalancerTxLoading(false)
            handleNotification("error", "swap", dispatch, e.message)
        }
        const balances2 = await getBalances(
            tokenInputAddress,
            tokenOutputAddress,
            web3Provider,
            receipient
        )
        const amountReceived = balances2[1] - balances1[1]
        const amountSent = balances1[0] - balances2[0]
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
