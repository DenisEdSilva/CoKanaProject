import { firebase } from "@react-native-firebase/firestore";
import React, { useEffect, useState } from "react";
import { View, Text } from 'react-native';

interface RequestProps {
    id: string;
    createdAt: Date;
    expirationTime: Date;
    items: {
        productId: string;
        quantity: number;
    }
}

export default function Home() {
    const [requestList, setRequestList] = useState<RequestProps[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);

        const fetchRequests = async () => {
            try {
                const requestsSnapshot = await firebase.firestore().collection('requests').get();

                const requestsData = requestsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    createdAt: doc.data().createdAt,
                    expirationTime: doc.data().expirationTime,
                    items: doc.data().items
                }))

                setRequestList(requestsData);
                console.log(requestsData);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            }
        }

        fetchRequests();

    })

    return (
        <View>
            {requestList.map(request => (
                <View key={request.id}>
                    <Text>{request.id}</Text>
                    <Text>{request.items.productId}</Text>
                    <Text>{request.items.quantity}</Text>
                </View>
            ))}
        </View>
    )
}

