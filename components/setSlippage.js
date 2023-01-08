import { Input, Modal, SvgEdit } from "@web3uikit/core"
import { BigNumber } from "ethers"

import { useState } from "react"

export const SetSlippage = ({ setSlippagePercent }) => {
    const [ModalVisibility, setModalVisibility] = useState(false)
    const [slippage, setSlippage] = useState(5)

    return (
        <div>
            {ModalVisibility ? (
                <div>
                    <Modal
                        cancelText="Discard Changes"
                        id="regular"
                        isVisible={ModalVisibility}
                        okText="Save Changes"
                        onCancel={function noRefCheck() {
                            setModalVisibility(false)
                        }}
                        onCloseButtonPressed={function noRefCheck() {
                            setModalVisibility(false)
                        }}
                        onOk={() => {
                            try {
                                const setToBigNum = BigNumber.from(slippage)
                                if (setToBigNum.toString() >= 50) {
                                    throw "Slippage too High"
                                }
                                setSlippagePercent(setToBigNum)
                                setModalVisibility(false)
                            } catch (e) {
                                console.log(e)
                            }
                        }}
                        width="30%"
                    >
                        <Input
                            label="Slippage Percent"
                            width="100%"
                            placeholder={slippage}
                            onChange={(result) => {
                                setSlippage(result.target.value)
                            }}
                        />
                    </Modal>
                </div>
            ) : (
                <button
                    className="bg-blue-500 hover:bg-blue-700 font-bold text-white py-1 px-2 rounded m-3"
                    onClick={async function () {
                        setModalVisibility(true)
                    }}
                >
                    <div className="text-sm font-semibold">Set slippage</div>
                </button>
            )}
        </div>
    )
}
