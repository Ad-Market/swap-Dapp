import { Input, Modal, SvgEdit } from "@web3uikit/core"
import { BigNumber } from "ethers"

import { useState } from "react"

export const SetSlippage = ({ slippage, setSlippage, showSlippageModal, setShowSlippageModal }) => {
    const [slippageValue, setSlippageValue] = useState()

    const handle = (e) => {
        if (e.target.id === "wrapper") {
            setShowSlippageModal(false)
        }
    }

    if (showSlippageModal == false) {
        return null
    }

    return (
        <div
            className=" fixed inset-0 backdrop-blur-sm bg-opacity-25 flex justify-center pt-20"
            onClick={(e) => {
                handle(e)
            }}
            id="wrapper"
        >
            <div className="bg-slate-700 sm:w-80 w-4/5 rounded-lg p-4 h-fit">
                <div className="flex justify-between">
                    <h1 className="font-semibold text-slate-400">set Slippage</h1>
                    <button
                        className="bg-red-500 hover:bg-red-700 font-bold text-white py-1 px-2 rounded-lg mb-2"
                        onClick={async function () {
                            setShowSlippageModal(false)
                        }}
                    >
                        <div className="text-sm font-semibold">X</div>
                    </button>
                </div>
                <input
                    className="my-2 outline-none border-2 border-slate-900 rounded-lg p-1 bg-slate-700 w-full text-white"
                    placeholder={slippage}
                    onChange={(e) => {
                        try {
                            if (Number(e.target.value) > 50) {
                                throw "slippage value Too High"
                            }
                            setSlippageValue(e.target.value)
                        } catch (e) {
                            console.log(e)
                            setSlippageValue(slippage)
                        }
                    }}
                ></input>
                <div className="flex justify-between">
                    <button
                        className="bg-red-500 hover:bg-red-700 font-bold text-white py-1 px-2 rounded mt-2"
                        onClick={async function () {
                            setShowSlippageModal(false)
                        }}
                    >
                        <div className="text-sm font-semibold">Close</div>
                    </button>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-1 px-2 rounded mt-2"
                        onClick={async function () {
                            setSlippage(slippageValue)
                            setShowSlippageModal(false)
                        }}
                    >
                        <div className="text-sm font-semibold">set Slippage</div>
                    </button>
                </div>
            </div>
        </div>
    )
}
