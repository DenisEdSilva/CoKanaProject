import React, { useState } from "react";
import { Button, Text, View, Modal } from "react-native";
import { NewProduct } from "../../../components/AdminComponents/NewProduct";
import { NewCategory } from "../../../components/AdminComponents/NewCategory";

export default function AdminProducts() {
    const [modalVisible, setModalVisible] = useState(false);
    const [typeModal, setTypeModal] = useState("");
    
    function openModalNewProduct() {
        setTypeModal("NewProduct");
        setModalVisible(true);
    }

    function openModalNewCategory() {
        setTypeModal("NewCategory");
        setModalVisible(true);
    }

    return (
        <View>
            <Button title="Registrar nova categoria" onPress={() => openModalNewCategory()} />
            <Button title="Registrar novo produto" onPress={() => openModalNewProduct()} />
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                    setTypeModal("")
                }}
            >
                <View>
                    { typeModal === "NewProduct" && <NewProduct />}
                    { typeModal === "NewCategory" && <NewCategory />}
                    <Button title="Fechar" onPress={() => {
                        setModalVisible(!modalVisible);
                        setTypeModal("")
                    }} />
                </View>
            </Modal>
        </View>
    )
}