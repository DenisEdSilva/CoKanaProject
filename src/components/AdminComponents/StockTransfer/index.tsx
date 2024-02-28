import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { TouchableOpacity, Text, View, TextInput } from 'react-native';
import { useAuth } from '../../../contexts/auth';
import { firebase } from '@react-native-firebase/auth';

interface StoreProps {
    storeId: string;
    storeName: string;
    index: number;
}

interface StockTransferProps {
    quantity: number;
    productId: string;
    sourceStoreId: string;
    destinationStoreId: string;
}

interface ProductProps {
    productId: string;
    storeId: string;
}

export function StockTransfer({ productId, storeId }: ProductProps) {
    const [stockQuantity, setStockQuantity] = useState<number | null>(null);
    const [storeList, setStoreList] = useState<StoreProps[]>([]);
    const [selectedStore, setSelectedStore] = useState<string>('');
    const { stockTransfer } = useAuth();

    useEffect(() => {
        const fetchProductAndStoreInfo = async () => {
            try {
                const productRef = firebase.firestore().collection('stores').doc(storeId)
                    .collection('products').doc(productId);
                const productSnapshot = await productRef.get();
                if (productSnapshot.exists) {
                    setStockQuantity(productSnapshot.data()?.quantity); 
                } else {
                    console.log('Produto não encontrado');
                }

                const storeRef = firebase.firestore().collection('stores').doc(storeId);
                const storeSnapshot = await storeRef.get();
                if (storeSnapshot.exists) {
                    console.log('Loja encontrada:', storeSnapshot.data());
                } else {
                    console.log('Loja não encontrada');
                }

                const allStoreList = firebase.firestore().collection('stores')
                    .orderBy('index');
                allStoreList.get().then((querySnapshot) => {
                    const storeList = querySnapshot.docs.map((doc) => ({
                        storeId: doc.id,
                        storeName: doc.data().name,
                        index: doc.data().index
                    }));
                    setStoreList(storeList);
                });
            } catch (error) {
                console.error('Erro ao buscar informações:', error);
            }
        };

        if (productId && storeId) {
            fetchProductAndStoreInfo();
        }
    }, [productId, storeId]);

    const handleStockTransfer = async () => {
        try {
            if (stockQuantity !== null && selectedStore) {
                const transferProps: StockTransferProps = {
                    quantity: stockQuantity,
                    productId: productId,
                    sourceStoreId: storeId,
                    destinationStoreId: selectedStore 
                };
    
                await stockTransfer(transferProps);
                setStockQuantity(null);
            }
        } catch (error) {
            console.error('Erro ao transferir estoque:', error);
        }
    }
    

    return (
        <View>
            <View style={{height: "15%", marginTop: '5%', borderBottomWidth: 3}}>
                <Text style={{fontWeight: 'bold', fontSize: 20, alignSelf: 'center' }}>Transferência de estoque</Text>
            </View>

            <View>
                <TextInput
                    placeholder="Quantidade"
                    value={stockQuantity?.toString() || ''}
                    onChangeText={text => setStockQuantity(parseInt(text))}
                    keyboardType="numeric"
                    style={{
                        margin: "2.5%",
                        borderWidth: 1,
                        borderRadius: 10,
                        padding: 10
                    }}
                />

                <Picker
                    selectedValue={selectedStore}
                    onValueChange={(itemValue, itemIndex) => setSelectedStore(itemValue)}
                    style={{
                        margin: "2.5%",
                        borderWidth: 1,
                        borderRadius: 10,
                    }}
                >
                    <Picker.Item label="Selecione a loja destino" value="" />
                    {storeList.map((store) => (
                        <Picker.Item key={store.storeId} label={store.storeName} value={store.storeId} />
                    ))}
                </Picker>

                <TouchableOpacity
                    style={{
                        padding: 10,
                        borderWidth: 1,
                        borderRadius: 10,
                        margin: "2.5%",
                        alignItems: "center"
                    }}
                    onPress={handleStockTransfer}
                >
                    <Text
                        style={{
                            color: 'blue',
                            fontWeight: "bold",
                            fontSize: 16
                        }}
                        onPress={handleStockTransfer}
                    >
                        Transferir
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}