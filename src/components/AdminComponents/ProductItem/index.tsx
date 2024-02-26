import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { firebase } from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';

interface RouteParams {
    productId: string;
}

export function ProductItem() {
    const route = useRoute();
    const { productId } = route.params as RouteParams;
    const [stores, setStores] = useState<any[]>([]);

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const productRef = firebase.firestore().collection('products').doc(productId);
                const productDoc = await productRef.get();
                const productData = productDoc.data();

                if (productData) {
                    const storesSnapshot = await firebase.firestore()
                        .collection('products').doc(productId).collection('stock')
                        .where('productId', '==', productId)
                        .get();

                    const storesData = await Promise.all(storesSnapshot.docs.map(async doc => {
                        const storeId = doc.data().storeId;
                        const storeRef = firebase.firestore().collection('stores').doc(storeId);
                        const storeDoc = await storeRef.get();
                        const storeData = storeDoc.data();
                        return {
                            id: doc.id,
                            storeName: storeData?.name || 'Nome não encontrado',
                            quantity: doc.data().quantity
                        };
                    }));

                    setStores(storesData);
                }
            } catch (error) {
                console.error("Erro ao buscar lojas:", error);
            }
        };

        fetchStores();
    }, [productId]);

    return (
        <View>
            <Text
                style={{ 
                    fontSize: 20, 
                    fontWeight: 'bold',
                    color: '#333333',
                    alignSelf: 'center',
                    paddingTop: 20,
                    paddingBottom: 20
                }}
            >Lojas</Text>
            {stores.map(store => (
                <View 
                    key={store.id}
                    style={{
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        backgroundColor: '#ffffff', 
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        padding: 14,
                        marginBottom: 15,
                        elevation: 6,
                    }}
                
                >
                    <Text style={{ fontSize: 18}}><Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333'}}>Nome: </Text>{store.storeName}</Text>
                    <Text style={{ fontSize: 18}}><Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333'}}>Quantidade: </Text>{store.quantity}</Text>
                </View>
            ))}
        </View>
    );
}
