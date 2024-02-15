import React, { useState } from "react";
import { Text, TouchableOpacity, View, Button, Modal, Image } from "react-native";
import { useAuth } from "../../../contexts/auth";
import { NewStore } from "../../../components/AdminComponents/NewStore";
import { NewUser } from "../../../components/AdminComponents/NewUser";

export default function AdminPerfil() {
    const [modalVisible, setModalVisible] = useState(false);
    const [typeModal, setTypeModal] = useState("");
    const { user } = useAuth();

    const logo = require("../../../assets/LogoCokana.png");

    function openModalNewStore() {
        setTypeModal("NewStore");
        setModalVisible(true);
    }

    function openModalNewUser() {
        setTypeModal("NewUser");
        setModalVisible(true);
    }


    const { signOut } = useAuth();
    async function toggleLogOut() {
        await signOut();
    }

    return (
        <View 
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",

            }}
        >
            <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 100 }} >
                <Image source={logo} style={{ width: 180, height: 180 }} />
                <Text 
                    style={{
                        fontSize: 24, 
                        fontWeight: "bold", 
                        marginBottom: 10, 
                        textAlign: "center", 
                        color: "#000"
                    }} 
                >
                    {user?.name}
                </Text>
            </View>
            <TouchableOpacity
                style={{
                    width: "90%",
                    alignItems: "center",
                    padding: 6,
                    borderWidth: 1,
                    backgroundColor: "#3c7a5e",
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: 10
                }}
                onPress={() => openModalNewStore()} 
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} >Criar Nova Loja</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={{
                    width: "90%",
                    alignItems: "center",
                    padding: 6,
                    borderWidth: 1,
                    backgroundColor: "#3c7a5e",
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: 10
                }}
                onPress={() => openModalNewUser()} 
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} >Criar Novo Usuário</Text>
            </TouchableOpacity>

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
                    { typeModal === "NewStore" && <NewStore />}
                    { typeModal === "NewUser" && <NewUser />}
                    
                    <Button title="Fechar" onPress={() => {
                        setModalVisible(!modalVisible);
                        setTypeModal("")
                    }} />
                </View>
            </Modal>
                    

            <TouchableOpacity
                onPress={toggleLogOut}
                style={{
                    width: "90%",
                    alignItems: "center",
                    padding: 6,
                    borderWidth: 1,
                    backgroundColor: "#a92323",
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: 10
                }}
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} >Sair</Text>
            </TouchableOpacity>
            
        </View>
    )
}