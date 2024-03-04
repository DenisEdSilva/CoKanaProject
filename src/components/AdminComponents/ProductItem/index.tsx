import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { firebase } from '@react-native-firebase/firestore';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StockTransfer } from '../StockTransfer';
import { ReplenishProduct } from '../ReplenishProduct';
import { useNavigation } from '@react-navigation/native';

interface RouteParams {
    productId: string;
}

export function ProductItem() {
    const route = useRoute();
    const { productId } = route.params as RouteParams;
    const [stores, setStores] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const [modalType, setModalType] = useState<string>('');
    const nav = useNavigation<any>();


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

    const openModal = (store: any, type: string) => {
        setSelectedStore(store.id);
        setModalType(type);
        setModalVisible(true);
    };

    const handleCloseModal = () => {
        setModalVisible(false);
    };

    return (
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
                <Text style={{fontSize: 24, fontWeight: "bold", flex: 1, textAlign: 'center', color: "#2f5d50"}}>Lojas</Text>
                <View style={{width: "12.5%"}}></View>
            </View>
            {stores.map(store => (
                <View 
                    key={store.id}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'stretch',
                        justifyContent: 'space-between',
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
                    <View>
                        <Text style={{ fontSize: 18}}><Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333'}}>Nome: </Text>{store.storeName}</Text>
                        <Text style={{ fontSize: 18}}><Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333333'}}>Quantidade: </Text>{store.quantity}</Text>
                    </View>
                    <View 
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignSelf: 'center',
                            marginRight: 10,
                            padding: 10
                        }}
                    >
                        <TouchableOpacity
                            onPress={() => openModal(store, "StockTransfer")}
                            style={{
                                marginRight: 10,
                                padding: 10,
                                alignSelf: 'center',
                                backgroundColor: '#39e463',
                            }}
                        >
                            <Icon name="swap-horiz" size={24} color="#333333" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => openModal(store, "ReplenishProduct")}
                            style={{
                                marginRight: 10,
                                padding: 10,
                                alignSelf: 'center',
                                backgroundColor: '#39e463',
                            }}
                        >
                            <Icon name="add" size={24} color="#333333" />
                        </TouchableOpacity>
                    </View>
                </View>                
            ))}
            <Modal
                animationType="fade"
                transparent={false}
                visible={modalVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={{marginTop: 35 }}>
                    {modalType === 'StockTransfer' && (
                       <StockTransfer storeId={selectedStore} productId={productId} />
                    )}
                    {modalType === 'ReplenishProduct' && (
                       <ReplenishProduct storeId={selectedStore} productId={productId} />
                    )}
                </View>
            </Modal>
        </View>
    );
}
