import React, { useRef } from 'react'
import { Picker } from '@react-native-picker/picker'
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useAuth } from '../../../contexts/auth'

export function NewUser() {
    const [selectedRole, setSelectedRole] = React.useState("seller");
    const [userName, setUserName] = React.useState("");
    const [userEmail, setUserEmail] = React.useState("");
    const [userPass, setUserPass] = React.useState("");
    const { signUp, loadingAuth } = useAuth();

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

    async function handleSignUp() {
        if (userName === "" || userEmail === "" || userPass === "") {
            console.log("preencha todos os campos!")
            return;
        }
        signUp({ role: selectedRole, name: userName, email: userEmail, password: userPass })
        setSelectedRole("seller")
        setUserName("")
        setUserEmail("")
        setUserPass("")
    }

    return (
        <View style={{
            alignItems: "center",
            justifyContent: "center",
            margin: 10
        }}>            
            <View
                style={{ 
                    width: 350,
                    margin: 5,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}
            >
                <Picker
                    ref={pickerRef}
                    selectedValue={selectedRole}
                    onValueChange={(itemValue, itemIndex) => {
                        setSelectedRole(itemValue)
                    }
                }>
                    <Picker.Item label="Administrador" value="admin" />
                    <Picker.Item label="Vendedor" value="seller" />
                </Picker>
            </View>

            <TextInput
                placeholder="Insira seu Nome"
                maxLength={30}
                autoCapitalize="none"
                onChangeText={text => setUserName(text)}
                value={userName}
                style={{
                    padding: 10,
                    width: 350,
                    fontSize: 16,
                    borderWidth: 2,
                    margin: 5,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                    
                }}
            />
            <TextInput
                placeholder="Insira seu email"
                maxLength={30}
                autoCapitalize="none"
                onChangeText={text => setUserEmail(text)}
                value={userEmail.trim()}
                style={{
                    padding: 10,
                    width: 350,
                    fontSize: 16,
                    margin: 5,
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
                autoCapitalize="none"
                onChangeText={text => setUserPass(text)}
                value={userPass.trim()}
                style={{
                    padding: 10,
                    width: 350,
                    fontSize: 16,
                    margin: 5,
                    borderWidth: 2,
                    borderBottomLeftRadius: 10,
                    borderBottomRightRadius: 10,
                    borderTopLeftRadius: 10,
                    borderTopRightRadius: 10,
                }}
            />
            <TouchableOpacity
                onPress={handleSignUp} 
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
                    marginTop: 10
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
                    Cadastrar
                </Text>
            )}
            </TouchableOpacity>
        </View>
    )
} 

