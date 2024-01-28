import React from "react";
import { Text, TouchableOpacity, View, Button } from "react-native";
import { useAuth } from "../../../contexts/auth";

export default function AdminPerfil() {
    const { signOut } = useAuth();
    async function toggleLogOut() {
        await signOut();
    }

    return (
        <View>
            <Text>Admin Perfil</Text>

            
            <Button title="Registrar nova loja" />
            <Button title="Registrar novo usuário" />

            <TouchableOpacity
                onPress={toggleLogOut}
                style={{
                    width: 300,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    marginTop: 10
                }}
            >
                <Text>Sair</Text>
            </TouchableOpacity>
            
        </View>
    )
}