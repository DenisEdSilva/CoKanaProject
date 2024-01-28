import React, { useState } from "react";
import { Button, Text, View, Modal } from "react-native";
import { NewProduct } from "../../../components/AdminComponents/NewProduct";

export default function AdminProducts() {
    const [modalVisible, setModalVisible] = useState(false);

    return (
        <View>
            <Button title="Registrar nova categoria" onPress={() => setModalVisible(true)} />
            <Button title="Registrar novo produto" onPress={() => setModalVisible(true)} />
            <Modal
                animationType="slide"
                transparent={false}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View>
                    <NewProduct />
                    <Button title="Fechar" onPress={() => setModalVisible(false)} />
                </View>
            </Modal>
        </View>
    )
}