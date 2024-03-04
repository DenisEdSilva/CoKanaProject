import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { firebase } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

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

    function handleSelectProduct(productId: string) {
        nav.navigate("ProductItem", { productId });
    }

    return (
        <View>
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
                            paddingLeft: 10,
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
                    {productList.slice().sort((a, b) => a.name.localeCompare(b.name)).map(product => (
                        <View 
                            key={product.id}
                            style={{
                                flexDirection: 'column',
                                alignItems: 'stretch',
                                backgroundColor: '#ffffff', 
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.25,
                                shadowRadius: 3.84,
                                marginBottom: 15,
                                elevation: 6,
                            }}  
                        >
                            <TouchableOpacity  
                                style={{
                                    width: "100%",
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 20,
                                    paddingVertical: 15
                                }}
                                onPress={() => handleSelectProduct(product.id)}
                            >
                                <Text
                                    style={{ 
                                        fontSize: 20, 
                                        fontWeight: 'bold',
                                        color: '#333333'
                                    }}
                                >{product.name}</Text>
                                <Icon name="arrow-forward" size={20} color="#333333" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};
