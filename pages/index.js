import Head from "next/head"
import { ConnectButton } from "@web3uikit/web3"
import PriceFunctions from "../components/priceFunction"
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
            <div class="flex border-b-2 border-indigo-600 rounded-lg p-3 justify-between bg-gray-200">
                <h1 class="text-xl font-bold self-center">Swap Dapp</h1>

                <ConnectButton />
            </div>
            <div>
                <PriceFunctions />
                {/* <Select /> */}
            </div>
        </div>
    )
}
