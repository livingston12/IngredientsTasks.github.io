import React, { useState } from "react";
import Icons from "../Components/Icons";
import Button from "./Form/Button";
import Drawer from "./Drawer";
import { ChatCompletation } from "./IALocal/UseIALocal";

const IngredientList = ({ shoppingLists, id, handlenSubmitIngredient, handlenRemoveIngredient, engine }) => {
    const [ingredient, setIngredient] = useState('');
    const [isOpenAddList, setIsOpenAddList] = useState(false);
    const [reply, setReply] = useState('');
    const [messages, setMessages] = useState([
    ]);
    const [error, setError] = useState(null);
    const [cancelStream, setCancelStream] = useState(null);

    const ingredientList = shoppingLists.find(c => c.id === id);
    const isDisabledClass = `${!ingredientList ? 'bg-gray-400 text-gray-800 cursor-not-allowed' : ''}`;
    const handleSubmit = (e) => {
        e.preventDefault();
        setIngredient('');
        handlenSubmitIngredient(e);
    }

    const handleReply = (newContent) => {
        setReply((prevReply) => prevReply + newContent);
    };

    const handleError = (error) => {
        setError(error.message);
    };

    const handlenRecipes = async () => {

        setReply('');

        if (!engine) {
            console.error('Engine is not initialized');
            return;
        }

        try {
            setIsOpenAddList(prev => !prev);

            const listIngredients = ingredientList.ingredients.map(item => item.ingredient);

            const newMessage = `Muestra recetas con los siguientes ingredientes en orden y menos de 500 palabras: [${listIngredients.join(',')}]`;
            const userMessage = [...messages, { role: "user", content: newMessage }];
            const cancel = await ChatCompletation(engine, userMessage, handleReply, handleError);
            setCancelStream(() => cancel);
            setMessages((prevMessages) => [...prevMessages, { role: "user", content: newMessage }]);

            //setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: reply }]);
        } catch (err) {
            console.error('Error calling ChatCompletation:', err);
        }

    }

    const handlenCloseRecipes = () => {
        setIsOpenAddList(prev => !prev);
        try {
            cancelStream();
        }
        catch (err) {
            console.error('Error calling ChatCompletation:', err);
        }
    }
    return (
        <aside className="flex flex-col w-full h-[100dvh] bg-[var(--gray-dark)]">
            <div className="w-full h-12 bg-gray-300 pl-10 pt-2 font-bold">
                {ingredientList !== undefined ? ingredientList.nombre : ''}
            </div>
            <div className="flex flex-col gap-2 h-[84dvh] overflow-y-auto ">
                {ingredientList === undefined ? '' :
                    ingredientList.ingredients.length <= 0 ?
                        <div className="flex justify-center text-white">No hay ingredientes</div>
                        : ingredientList.ingredients.map(item => {
                            return (
                                <article key={item.id} className="flex bg-gray-400 p-3 justify-between ">
                                    <h2 className="font-semibold">{item.ingredient}</h2>
                                    <Button>
                                        <span className="hover:text-red-700" onClick={() => handlenRemoveIngredient(item.id)}><Icons icon="x" className="w-5"></Icons></span>
                                    </Button>
                                </article>
                            )
                        })}
            </div>

            <div className="w-full bg-gray-300 flex items-center">
                <Button
                    onClick={handlenRecipes}
                    disabled={!ingredient}
                    className={`bg-blue-600 ml-3 p-2 h-10 rounded-lg text-white ${isDisabledClass}`}
                >
                    Recetas
                </Button>

                <form className="p-5 w-full" onSubmit={handleSubmit}>
                    <div className="flex w-full bg-white overflow-hidden rounded-lg">
                        <textarea
                            value={ingredient}
                            onChange={(e) => setIngredient(e.target.value)}
                            name="ingredient"
                            className={`w-full border-0 p-2 outline-none  resize-none ${isDisabledClass}`}
                            placeholder="Agregar Ingrediente "
                        />
                        <Button className={`p-5 ${isDisabledClass}`}>
                            <Icons icon="send" className="w-5" />
                        </Button>
                    </div>
                </form>
            </div>
            <Drawer
                isOpenAddList={isOpenAddList}
                setIsOpenAddList={handlenCloseRecipes}
                size="w-[100%]"
                title={`Recetas de ${ingredientList !== undefined ? ingredientList.nombre : ''}`}
            >
                <div className="p-4 w-screen h-screen flex justify-center bg-[var(--gray-dark)]">
                    <textarea
                        value={reply}
                        className={`w-[98%] h-[90%] border-0 p-2 outline-none resize-none  rounded-lg `}
                    />
                </div>
            </Drawer>

        </aside>

    );

}


export default IngredientList;