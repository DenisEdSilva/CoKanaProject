import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../contexts/auth';

interface RouteParams {
  categoryId: string;
}

interface Product {
  id: string;
  category: string;
  name: string;
  price: number;
  quantity: number;
}

export function ProductList() {
    const route = useRoute();
    const { categoryId } = route.params as RouteParams;
    const nav = useNavigation<any>();
    const [productList, setProductList] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
    const { registerRequest } = useAuth();

    useEffect(() => {

        const fetchProductsInCategory = async () => {
            try {
                const productsSnapshot = await firebase.firestore()
                    .collection('products')
                    .where('category', '==', categoryId)
                    .get();
        
                const productsData = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    category: doc.data().category,
                    name: doc.data().name,
                    price: doc.data().price,
                    quantity: doc.data().quantity
                }));
                setProductList(productsData);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar produtos:", error);
            }
        };
        fetchProductsInCategory();

    }, [ categoryId ]);

    function handleAdd(productId: string) {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: (prevQuantities[productId] || 0) + 1
        }));
    }

    function handleRemove(productId: string) {
        setQuantities(prevQuantities => ({
            ...prevQuantities,
            [productId]: Math.max((prevQuantities[productId] || 0) - 1, 0)
        }));
    }

    function handleRegisterRequest() {
        registerRequest(quantities);
    }

    return (
        <View style={{ width: "100%" }}>
            {loading ? (
                <Text>Carregando produtos...</Text>
            ) : (
                <View>
                    <View 
                        style={{ 
                            flexDirection: 'row',
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            marginBottom: 35, 
                            paddingHorizontal: 10,
                            paddingTop: 25
                        }}
                    >
                        <TouchableOpacity 
                            style={{width: "12.5%"}}
                            onPress={() => nav.goBack()}
                        >
                            <Icon name="arrow-back" size={30} color="#2f5d50"/>
                        </TouchableOpacity>
                        <Text style={{fontSize: 24, fontWeight: "bold", flex: 1, textAlign: 'center', color: "#2f5d50"}}>Produtos</Text>
                        <View style={{width: "12.5%"}}></View>
                    </View>
                    <FlatList
                        data={productList.slice().sort((a, b) => a.name.localeCompare(b.name))}
                        keyExtractor={(item) => item.id.toString()}
                        numColumns={2}
                        renderItem={({ item }) => (
                            <View
                                style={{
                                    backgroundColor: '#ffffff',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    shadowColor: "#000",
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    marginBottom: 15,
                                    elevation: 6,
                                    flex: 1,
                                    margin: 5,
                                    borderRadius: 8,
                                }}
                            >
                                <View style={{ justifyContent: 'center' }}>
                                    <Text
                                        style={{
                                            fontSize: 20,
                                            fontWeight: 'bold',
                                            color: '#333333',
                                            paddingHorizontal: 20,
                                            paddingVertical: 15,
                                        }}
                                    >{item.name}</Text>
                                </View>
                                <View 
                                    style={{
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        padding: 15
                                    }}
                                >
                                    <TouchableOpacity 
                                        style={{
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            backgroundColor: '#2f5d50',
                                            marginRight: 10
                                        }}
                                        onPress={() => handleAdd(item.id)}
                                    >
                                        <Icon name="add" size={24} color="white" />
                                    </TouchableOpacity>
                                    <View
                                        style={{
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            borderColor: '#2f5d50',
                                            paddingRight: 10,
                                            paddingLeft: 10,
                                            paddingTop: 3,
                                            paddingBottom: 3,
                                            marginRight: 10,
                                            marginLeft: 10
                                        }}
                                    >
                                        <Text>{quantities[item.id] || 0}</Text>
                                    </View >
                                    <TouchableOpacity
                                        style={{
                                            borderWidth: 1,
                                            borderRadius: 5,
                                            backgroundColor: '#2f5d50',
                                            marginLeft: 10
                                        }}
                                        onPress={() => handleRemove(item.id)}
                                    >
                                        <Icon name="remove" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
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
                            marginTop: 10,
                            marginLeft: "5%",
                            marginRight: "5%",
                        }}
                        onPress={() => handleRegisterRequest()}
                    >
                        <Text style={{ fontSize: 16, color: 'white', fontWeight: 'bold'}} onPress={() => handleRegisterRequest()}>Concluir</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};
