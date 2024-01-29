import React, { useEffect, useState } from "react";
import { View, Text,  TextInput, TouchableOpacity} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../../../contexts/auth";
import firestore from '@react-native-firebase/firestore';

interface Category {
    id: string;
    category: string;
}

export function NewProduct() {
    const [category, setCategory] = useState<Category[]>([]);
    console.log(category)
    const [productCategory, setProductCategory] = useState("");
    console.log(productCategory)
    const [productName, setProductName] = useState("");
    const [productQuantity, setQuantity] = useState("");
    const [productPrice, setPrice] = useState("");
    const { registerProduct } = useAuth();

    useEffect(() => {
        const unsubscribe = firestore()
        .collection('categories')
        .onSnapshot((snapshot) => {
            const newCategories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Category[];
          setCategory(newCategories);

          if (newCategories.length > 0) {
            setProductCategory(newCategories[0].category);
          }

        }, (error) => {
          console.error(error);
        });
      return () => unsubscribe();
    }, []);

    function handleRegisterProduct() {
        if (!productName || !productQuantity || !productPrice) {
            console.log("Preencha todos os campos");
            return;
        }
        const product = {productCategory, productName, productQuantity, productPrice};
        registerProduct(product)
    }

    const handlePriceChange = (text: string) => {

        let num = text.replace(/[^0-9]/g, '');
        if (num.length === 1) {
            num = '0.0' + num;
        } else if (num.length === 2) {
            num = '0.' + num;
        } else {
            num = num.slice(0, -2) + '.' + num.slice(-2);
        }
        const numFloat = parseFloat(num).toFixed(2);
        setPrice(numFloat);
    }


    return (
        <View style={{padding: 20, alignItems: "center", }}>
            <Text style={{fontSize: 20, fontWeight: "bold", marginBottom: 10, textAlign: "center"}}>Cadastro de Novo Produto</Text>
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
                    selectedValue={productCategory}
                    onValueChange={(itemValue, itemIndex) => setProductCategory(itemValue)}
                >
                    {category.map((category) => (
                        <Picker.Item key={category.id} label={category.category} value={category.category} />    
                    ))}
                </Picker>
            </View>
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
                placeholder="Nome do Produto" 
                value={productName} 
                onChangeText={(text) => setProductName(text) } 
            />
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
                placeholder="Quantidade"
                value={productQuantity}  
                onChangeText={(text) => setQuantity(text)} 
            />
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
                keyboardType="numeric"
                maxLength={10}
                placeholder="Preço" 
                value={`R$ ` + productPrice} 
                onChangeText={handlePriceChange} 
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
                onPress={handleRegisterProduct}
            >
                <Text style={{fontSize: 16, fontWeight: "bold", color: "white"}} onPress={handleRegisterProduct}>
                    Cadastrar
                </Text>
            </TouchableOpacity>
        </View>
    )
}