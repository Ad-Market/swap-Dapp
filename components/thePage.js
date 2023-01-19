import { SetSlippage } from "./setSlippage"
import { RiArrowDropDownLine } from "react-icons/ri"
import { useEffect, useState } from "react"

export const ThePage = ({
    setAmount1,
    setAmount2,
    token1,
    token2,
    amount1,
    amount2,
    setActive,
    setTokenNum,
    setShowModal,
    setShowSlippageModal,
    swapWithBest,
    bestRate,
}) => {
    const [swapState, setSwapState] = useState(false)

    useEffect(() => {
        if (Number(bestRate) > 0) {
            setSwapState(false)
        } else {
            setSwapState(true)
        }
    }, [bestRate])

    return (
        <div className="mb-3 bg-slate-600 rounded-lg flex sm:w-96 w-11/12 flex-col">
            <div className=" flex justify-between rounded-t-lg">
                <h1 className="m-3 text-white font-bold">Swap</h1>
                <button
                    className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-1 px-2 rounded m-3"
                    id="testing"
                    onClick={async function () {
                        setShowSlippageModal(true)
                    }}
                >
                    <div className="text-sm font-semibold">Set slippage</div>
                </button>
            </div>
            <div className="m-5 border-solid border-2 bg-gray-700 px-4 py-3 flex justify-between rounded-lg">
                <input
                    className="outline-none bg-gray-700 text-white w-1/2"
                    onChange={(e) => {
                        if (Math.abs(e.target.value) == 0) {
                            setAmount1(0)
                        } else {
                            setAmount1(Math.abs(e.target.value))
                        }

                        setActive("1")
                    }}
                    placeholder="0.00"
                    type="number"
                    value={amount1}
                ></input>
                <button
                    className="border-solid shadow-lg shadow-black hover:shadow-none mx-2 my-1 p-1 bg-gray-400 rounded-lg flex items-center justify-between"
                    onClick={() => {
                        setTokenNum(1)
                        setShowModal(true)
                    }}
                >
                    <p className="">{token1}</p>
                    <RiArrowDropDownLine className="text-blue-700 text-xl" />
                </button>
            </div>
            <hr className="mx-5" />
            <div className="m-5 border-solid border-2 bg-gray-700 px-4 py-3 flex justify-between rounded-lg">
                <input
                    className="outline-none bg-gray-700 text-white w-1/2"
                    placeholder="0.00"
                    onChange={(e) => {
                        if (Math.abs(e.target.value) == 0) {
                            setAmount2(0)
                        } else {
                            setAmount2(Math.abs(e.target.value))
                        }

                        setActive("2")
                    }}
                    value={amount2}
                    type="number"
                ></input>
                <button
                    className="border-solid shadow-lg shadow-black hover:shadow-none mx-2 my-1 p-1 bg-gray-400 rounded-lg flex items-center justify-between"
                    onClick={() => {
                        setTokenNum(2)
                        setShowModal(true)
                    }}
                >
                    <p className="">{token2}</p>
                    <RiArrowDropDownLine className="text-blue-700 text-xl" />
                </button>
            </div>
            <hr className="mx-5" />
            <div className=" p-3">
                <button
                    disabled={swapState}
                    className="border-solid shadow-md hover:shadow-none shadow-black p-1 bg-cyan-800 rounded-md w-full disabled:bg-cyan-600 disabled:shadow-none"
                    onClick={() => {
                        swapWithBest()
                    }}
                >
                    <p className="text-zinc-100 font-semibold">Swap</p>
                </button>
            </div>
        </div>
    )
}
