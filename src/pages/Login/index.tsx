import React, { useContext, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { AuthContext, useAuth } from "../../contexts/auth";


function Login() {
    const [selectedRole, setSelectedRole] = React.useState("seller");
    const [userName, setUserName] = React.useState("");
    const [userEmail, setUserEmail] = React.useState("");
    const [userPass, setUserPass] = React.useState("");
    const { signIn, signUp, loadingAuth } = useAuth();
    

    async function handleSignIn() {
        if (userEmail === "" || userPass === "") {
            console.log("preencha todos os campos!")
            return;

        }
        console.log(userEmail, userPass);
        signIn({email: userEmail, password: userPass});

    }

    const pickerRef = useRef<Picker<string> | null>(null);

    function open() {
        if (pickerRef.current) {
            pickerRef.current.focus();
        }
    }

    function close() {
        if (pickerRef.current) {
            pickerRef.current.blur();
        }
    }

    const imgLogo = "../../assets/LogoCokana.png"

    return (
        <View style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        }}>
            <Image 
                style={{ 
                    width: 225,
                    height: 225,
                }}
                source={require(imgLogo)}
            >

            </Image>
            <TextInput
                placeholder="Insira seu email"
                maxLength={30}
                onChangeText={text => setUserEmail(text)}
                value={userEmail}
                style={{
                    padding: 10,
                    width: 350,
                    fontSize: 16,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    
                }}
            />
            <TextInput
                placeholder="Insira sua senha"
                secureTextEntry={true}
                maxLength={30}
                onChangeText={text => setUserPass(text)}
                value={userPass}
                style={{
                    padding: 10,
                    width: 350,
                    fontSize: 16,
                    margin: 10,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}
            />
            <TouchableOpacity
                onPress={handleSignIn} 
                style={{
                    width: 350,
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}
            >
                { loadingAuth ? (
                    <ActivityIndicator size={16} color="#00ff00" />
                ) : (
                    <Text 
                        style={{
                            fontSize: 16,
                            fontWeight: "bold",
                        }} 
                    >
                        Acessar
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    )
}

export default Login;