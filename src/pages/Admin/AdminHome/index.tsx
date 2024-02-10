import React from "react";
import { Text, View } from "react-native";
import { useAuth } from "../../../contexts/auth";

export default function AdminHome() {
    const { user } = useAuth();

    return (
        <View>
            <Text>Tela do Administrador</Text>
        </View>
    )
}