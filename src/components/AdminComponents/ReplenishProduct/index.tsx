import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, Text, TextInput, View } from 'react-native';
import { firebase } from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../../contexts/auth';

interface ProductProps {
    categoryId: string;
    productId: string;
    storeId: string;
}

export function ReplenishProduct({ categoryId, productId, storeId }: ProductProps) {
    const [quantity, setQuantity] = useState<Number | null>(null);
    const [productInfo, setProductInfo] = useState<any>(null);
    const [storeInfo, setStoreInfo] = useState<any>(null);
    const [stockQuantity, setStockQuantity] = useState<number | null>(null);
    const { updateStockQuantity } = useAuth();

    useEffect(() => {
        console.log(categoryId, productId, storeId)
        const fetchProductAndStoreInfo = async () => {
            try {
                const productRef = firebase.firestore().collection('stores').doc(storeId)
                                   .collection('products').doc(productId);
                const productSnapshot = await productRef.get();
                if (productSnapshot.exists) {
                    setProductInfo(productSnapshot.data());
                } else {
                    console.log('Produto não encontrado');
                }

                const storeRef = firebase.firestore().collection('stores').doc(storeId);
                const storeSnapshot = await storeRef.get();
                if (storeSnapshot.exists) {
                    setStoreInfo(storeSnapshot.data());
                    console.log('Loja não encontrada');
                }
            } catch (error) {
                console.error('Erro ao buscar informações:', error);
            }
        };

        if (categoryId && productId && storeId) {
            fetchProductAndStoreInfo();
        }
    }, [categoryId, productId, storeId]);

    useEffect(() => {
        console.log(productInfo);
    }, [productInfo]);
    
    useEffect(() => {
        console.log(storeInfo);
    }, [storeInfo]);
    

    const handleAddProduct = async () => {
        console.log(productId, storeId, quantity)
        try {
            await updateStockQuantity({
                quantity: quantity,
                stockId: categoryId,
                productId: productId,
                storeId: storeId
            });
        } catch (error) {
            console.error('Erro ao adicionar produto ao estoque:', error);
        }
    };

    return (
        <View>
            {productInfo && <Text><Text style={{fontWeight: 'bold'}}>Nome do Produto: </Text>{productInfo.name}</Text>}
            {storeInfo && <Text><Text style={{fontWeight: 'bold'}}>Nome da Loja: </Text>{storeInfo.name}</Text>}
            {stockQuantity !== null && <Text>Quantidade em estoque: {stockQuantity}</Text>}
            <TextInput
                placeholder="Quantidade"
                keyboardType="numeric"
                value={quantity?.toString()}
                onChangeText={text => setQuantity(parseInt(text))}
            />
           <Button title="Adicionar produto" onPress={handleAddProduct} />  
        </View>
    );
}