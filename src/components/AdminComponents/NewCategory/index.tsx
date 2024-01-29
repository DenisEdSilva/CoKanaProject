import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useAuth } from "../../../contexts/auth";

export function NewCategory() {
    const [newCategory, setNewCategory] = useState("");
    const { registerCategory } = useAuth()

    function handleRegisterCategory() {
        if (!newCategory) {
            console.log("Preencha todos os campos");
            return;
        }
        const category = {newCategory};      
        registerCategory(category);  
    }
    
    return (
        <View style={{padding: 20, alignItems: "center", }}  >
            <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>Cadastro de Nova Categoria</Text>
            <TextInput 
                style={{ 
                    padding: 10,
                    width: 350,
                    margin: 5,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}  
                placeholder="Nome da categoria" 
                value={newCategory}
                onChangeText={(text) => setNewCategory(text)}
            />
            <TouchableOpacity
                style={{
                    width: 350,
                    alignItems: "center",
                    padding: 6,
                    borderWidth: 1,backgroundColor: "#52a3f3",
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: 10
                }}
                onPress={handleRegisterCategory}
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={handleRegisterCategory} >Criar categoria</Text>
            </TouchableOpacity>
        </View>
    );
}