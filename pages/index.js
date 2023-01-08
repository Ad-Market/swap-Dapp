import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
import { ConnectButton } from "@web3uikit/web3"
import PriceFunctions from "../components/priceFunction"
import { SetSlippage } from "../components/setSlippage"
import { useState } from "react"

export default function Home() {
    const [slippage, setSlippage] = useState(5)
    return (
        <div class="bg-slate-100 h-screen">
            <Head>
                <title>Swap Dapp</title>
                <meta name="description" content="Swap token on the cheapest platform" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div class="flex border-b-2 border-indigo-600 rounded-lg p-5 justify-between">
                <h1 class="text-3xl font-bold ">MY DAPP</h1>
                <div class="flex items-center">
                    <ConnectButton />
                    <SetSlippage setSlippagePercent={setSlippage} />
                </div>
            </div>
            <div>
                <PriceFunctions slippage={slippage} />
            </div>
        </div>
    )
}
