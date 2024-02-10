import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';

import { useAuth } from "../../../contexts/auth";

function Profile() {
    const { signOut, user } = useAuth();
    async function toggleLogOut() {
        await signOut();
    }

    return (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            
            <Text style={{ fontSize: 20 , fontWeight: "bold"}} >{user?.name}</Text>
            
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

export default Profile;