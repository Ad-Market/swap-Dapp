import Options from "../Utils/listOfTokenAddresses"

import { Select, Input } from "@web3uikit/core"
import { useState } from "react"

export default function My_form({
    setTokenOne,
    setTokenTwo,
    setAmountOne,
    setAmountTwo,
    tokenOne,
    tokenTwo,
    amountOne,
    amountTwo,
    setActive,
}) {
    const ListofOptions = Options()

    return (
        <div class=" grid grid-cols-2 gap-2 justify-items-center">
            <div class="col-start-1 col-end-2 my-3 ">
                <Select
                    customize={{
                        backgroundColor: "#eff6ff",
                        border: "2px solid #2563eb",
                        color: "#0e7490",
                        margin: "10px",
                    }}
                    height="40px"
                    label="TOKEN 1"
                    menuHeight="300px"
                    name="token 1"
                    onChange={(choice) => {
                        setTokenOne(choice.id)
                    }}
                    value={tokenOne}
                    isSearch
                    options={ListofOptions}
                    tryBeta
                    width="16em"
                />
            </div>
            <div class="col-start-2 col-end-3 my-3">
                {" "}
                <Select
                    customize={{
                        backgroundColor: "#eff6ff",
                        border: "2px solid #2563eb",
                        color: "#0e7490",
                        margin: "10px",
                    }}
                    height="40px"
                    label="TOKEN 2"
                    menuHeight="300px"
                    name="token 2"
                    onChange={(choice) => {
                        setTokenTwo(choice.id)
                    }}
                    value={tokenTwo}
                    isSearch
                    options={ListofOptions}
                    tryBeta
                    width="16em"
                />
            </div>
            <div class="col-start-1 col-end-2 my-3">
                <Input
                    label="Token1 Amount"
                    name="Amount"
                    onChange={(e) => {
                        setAmountOne(Math.abs(e.target.value))
                        setActive("1")
                    }}
                    width="20%"
                    type="number"
                    value={amountOne}
                    labelBgColor="#eff6ff"
                />{" "}
            </div>
            <div class="col-start-2 col-end-3 my-3">
                <Input
                    label="Token2 Amount"
                    name="Amount"
                    onChange={(e) => {
                        setAmountTwo(Math.abs(e.target.value))
                        setActive("2")
                    }}
                    type="number"
                    width="20%"
                    value={amountTwo}
                    labelBgColor="#eff6ff"
                />
            </div>
        </div>
    )
}
