import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../../contexts/auth';

interface StoreId {
    id: string
    name: string
}

interface Category {
    id: string
    name: string
}

export function EditProduct({ productId, category, name, price }: { productId: string, category: string, name: string, price: string}) {
    const [categories, setCategories] = useState<Category[]>([])
    const [currentProductCategory, setCurrentProductCategory] = useState(category)
    const [currentProductName, setCurrentProductName] = useState(name)
    const [currentProductPrice, setCurrentProductPrice] = useState(price)
    const [newProductCategory, setNewProductCategory] = useState(category)
    const [newProductName, setNewProductName] = useState(name)
    const [newProductPrice, setNewProductPrice] = useState(price)
    const { editProduct } = useAuth();


    useEffect(() => {
        const currentCategoryId = category;

        const categoriesRef = firestore().collection('categories')
            .orderBy('index');
        categoriesRef.get().then((querySnapshot) => {
            const categoriesList = querySnapshot.docs.map(doc => {
                return {
                    id: doc.id,
                    name: doc.data().name
                };
            });
        
            setCurrentProductCategory(currentCategoryId);
            setCategories(categoriesList);
        });
        
    }, []);

    function handleEditProduct(productId: string) {
        editProduct({
            productId,
            category: newProductCategory,
            name: newProductName,
            price: newProductPrice
        });
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
        
        setNewProductPrice(numFloat);
        setCurrentProductPrice(numFloat);
    }


    return (
        <View>
            <View>
                <View>
                    <Picker
                        selectedValue={currentProductCategory}
                        onValueChange={(itemValue, itemIndex) => {setCurrentProductCategory(itemValue); setNewProductCategory(itemValue)}}
                    >
                        {categories.filter((category) => category.name).map((category) => (
                            <Picker.Item key={category.id} label={category.name} value={category.id} />
                        ))}
                    </Picker>
                </View>
                <TextInput 
                    placeholder="Nome do Produto" 
                    value={currentProductName} 
                    onChangeText={ (text) => { setCurrentProductName(text); setNewProductName(text) } }
                />
                <TextInput
                    placeholder="Preço"
                    keyboardType='numeric'
                    value={`R$ ${parseFloat(currentProductPrice).toFixed(2)}`}
                    onChangeText={handlePriceChange}
                />
            </View>
            <TouchableOpacity 
                style={{
                    padding: 10, 
                    borderWidth: 1, 
                    borderBottomLeftRadius: 6, 
                    borderBottomRightRadius: 6, 
                    borderTopLeftRadius: 6, 
                    borderTopRightRadius: 6,
                    margin: 15,
                    backgroundColor: "#3c7a5e",
                    alignItems: "center"
                }}  
                onPress={() => handleEditProduct(productId)}
            >
                <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16}} >Concluir Edição</Text>
            </TouchableOpacity>
        </View>
    )
}