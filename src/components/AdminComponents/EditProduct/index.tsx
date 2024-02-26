import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import firestore from '@react-native-firebase/firestore'
import { Picker } from '@react-native-picker/picker';

interface StoreId {
    id: string
    name: string
}

interface Category {
    id: string
    name: string
}

export function EditProduct({ productId, category, name, quantity, price, storeId }: { productId: string, category: string, name: string, quantity: string, price: string, storeId: string }) {
    const [categories, setCategories] = useState<Category[]>([])
    const [storeIds, setStoreIds] = useState<StoreId[]>([])
    const [currentProductCategory, setCurrentProductCategory] = useState(category)
    const [currentProductStoreId, setCurrentProductStoreId] = useState(storeId)
    const [currentProductName, setCurrentProductName] = useState(name)
    const [currentProductPrice, setCurrentProductPrice] = useState(price)
    const [newProductCategory, setNewProductCategory] = useState(category)
    const [newProductStoreId, setNewProductStoreId] = useState(storeId)
    const [newProductName, setNewProductName] = useState(name)
    const [newProductQuantity, setNewProductQuantity] = useState(quantity)
    const [newProductPrice, setNewProductPrice] = useState(price)


    useEffect(() => {
        const currentCategoryId = category;
        const currentStoreIdId = storeId;

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

        const StoreIdsRef = firestore().collection('stores')
            .orderBy('index');
        StoreIdsRef.get().then((querySnapshot) => {
        const StoreIdsList = querySnapshot.docs.map((doc) => {
            return {
                id: doc.id,
                name: doc.data().name
            };
        });
        setCurrentProductStoreId(currentStoreIdId);
        setStoreIds(StoreIdsList);
        });
    }, []);

    function editProduct(productId: string) {
        firestore().collection('products').doc(productId).update({
            category: newProductCategory, 
            storeId: newProductStoreId, 
            name: newProductName,
            price: newProductPrice,
        }).catch(error => {
            console.log(error);
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
                <View>
                    <Picker
                        selectedValue={currentProductStoreId}
                        onValueChange={(itemValue, itemIndex) => {setCurrentProductStoreId(itemValue); setNewProductStoreId(itemValue)}}
                    >
                        {storeIds.filter((storeId) => storeId.name).map((StoreId) => (
                            <Picker.Item key={StoreId.id} label={StoreId.name} value={StoreId.id} />
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
                    value={`R$ ${currentProductPrice}`}
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
                    backgroundColor: "#52a3f3",
                    alignItems: "center"
                }}  
                onPress={() => editProduct(productId)}
            >
                <Text style={{color: "#fff", fontWeight: "bold", fontSize: 16}} >Concluir Edição</Text>
            </TouchableOpacity>
        </View>
    )
}