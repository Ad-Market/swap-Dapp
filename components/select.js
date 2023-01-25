import { useEffect, useState } from "react"
import Options from "../Utils/listOfTokenAddresses"
import { BiSearchAlt2 } from "react-icons/bi"
import { tokenLists } from "../prisma/listOfTokens"
import { useQuery } from "@apollo/client"
import { GET_TOKENS } from "./graphqlQueries"

export const Select = ({
    showModal,
    setShowModal,
    tokenNum,
    setToken1,
    setToken2,
    setTokenInputAddress,
    setTokenOutputAddress,
    setInputDecimal,
    setOutputDecimal,
}) => {
    const { loading, data, error } = useQuery(GET_TOKENS)
    const [completeList, setCompleteList] = useState(tokenLists)
    const [lists, setLists] = useState(completeList)

    const setTokenList = () => {
        if (!loading && !error) {
            setCompleteList(data.token)
        } else {
            setCompleteList(tokenLists)
        }
    }

    useEffect(() => {
        setTokenList()
    }, [data])

    const getList = (search) => {
        const ListofOptions = completeList
        const listArray = []
        ListofOptions.forEach((option) => {
            if (option.symbol.toLowerCase().includes(search.toLowerCase())) {
                listArray.push(option)
            }
        })
        const list = listArray.length < 1 ? ListofOptions : listArray
        setLists(list)
    }

    const handle = (e) => {
        if (e.target.id === "wrapper") {
            setShowModal(false)
            setTokenList()
        }
    }

    if (showModal == false) {
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
            <div className="bg-slate-700 sm:w-80 w-4/5 rounded-lg h-fit">
                <div className="grid grid-cols-9 py-3">
                    <BiSearchAlt2 className="self-center justify-self-center col-span-1 text-slate-300" />
                    <input
                        className="col-span-8 outline-none bg-slate-700 text-slate-300 font-semibold text-xl"
                        placeholder="search token"
                        onChange={(e) => {
                            getList(e.target.value)
                        }}
                        type="text"
                    ></input>
                </div>
                <hr className="mx-4 border-slate-400" />
                <div className="overflow-auto h-72">
                    <ul className="">
                        {lists.map((Option) => {
                            return (
                                <div key={lists.indexOf(Option)}>
                                    <li
                                        className=" p-3 hover:bg-slate-500 flex justify-right text-white text-xl font-semibold"
                                        onClick={() => {
                                            if (tokenNum == 2) {
                                                setToken2(Option.symbol)
                                                setTokenOutputAddress(Option.address)
                                                setOutputDecimal(Option.decimals)
                                            } else if (tokenNum == 1) {
                                                setToken1(Option.symbol)
                                                setTokenInputAddress(Option.address)
                                                setInputDecimal(Option.decimals)
                                            }
                                            setShowModal(false)
                                            setTokenList()
                                        }}
                                    >
                                        <div>{Option.symbol}</div>
                                    </li>
                                </div>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    )
}
