import { useEffect, useState } from "react";
import {
    Button,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";
import type { Member, Item } from "../models/model";

export type ItemDraft = {
    name: string;
    price: string;
    paidForMemberIds: number[];
    paidByMemberId: number | null;
};

type Props = {
    visible: boolean;
    members: Member[];
    onClose: () => void;
    onSave: (item: ItemDraft, editingItemId: number | null) => void;
    editingItem: Item | null;
};

export default function AddItemModal({
    visible,
    members,
    onClose,
    onSave,
    editingItem,
}: Props) {
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [validationError, setValidationError] = useState("");
    const [paidForMemberIds, setPaidForMemberIds] = useState<number[]>([]);
    const [paidByMemberId, setPaidByMemberId] = useState<number | null>(null);

    useEffect(() => {
        if (!visible) return;

        setName(editingItem?.name ?? "");
        setPrice(editingItem?.price ?? "");
        setPaidForMemberIds(editingItem?.paidFor ?? []);
        setPaidByMemberId(editingItem?.paidBy ?? null);
    }, [visible, editingItem]);

    const allMembersSelected =
        members.length > 0 &&
        members.every((member) => paidForMemberIds.includes(member.id));

        const toggleAllMembers = () => {
        setPaidForMemberIds(
            allMembersSelected ? [] : members.map((member) => member.id)
        );
    };

    const saveItem = () => {
        if (paidForMemberIds.length === 0){
            setValidationError("Add members first.");
            return
        }

        if (setPaidForMemberIds === null || paidByMemberId === null ) {
            setValidationError("Select who the item is for and who paid for it.");
            return;
        }

        if (!name.trim() || !price) return;

        onSave(
            {
                name: name.trim(),
                price,
                paidForMemberIds,
                paidByMemberId,
            }, 
                editingItem?.id ?? null
        );

        setName("");
        setPrice("");
        setValidationError("");
        setPaidForMemberIds([]);
        setPaidByMemberId(null);
        onClose();
    };

    const togglePaidForMember = (id: number) => {
        setPaidForMemberIds((current) =>
            current.includes(id)
            ? current.filter((memberId) => memberId !== id)
            : [...current, id]
        );
    };

    return (
        <Modal 
            visible={visible} 
            transparent animationType="fade" 
            onRequestClose={() => {
                setValidationError("")
                onClose
            }}
        >
            <View style={styles.backdrop}>
                <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                <View style={styles.popup}>
                    <Text style={styles.titleHeader}>
                        {editingItem ? editingItem.name : "Add Item"}
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Item Name"
                        placeholderTextColor="#003049"
                        style={styles.input}
                    />
                    <TextInput
                        value={price}
                        onChangeText={(text) =>
                        setPrice(text.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1"))
                        }
                        keyboardType="decimal-pad"
                        placeholder="Price"
                        placeholderTextColor="#888"
                        style={styles.input}
                    />
                    <Text>Paid for</Text>
                    {members.length ? (
                        <ScrollView horizontal contentContainerStyle={styles.memberOptions} keyboardShouldPersistTaps="handled">
                        <Pressable
                            onPress={toggleAllMembers}
                            style={[
                                styles.memberOption, 
                                allMembersSelected && styles.selectedMember
                            ]}
                        >
                            <Text>All</Text>
                        </Pressable>
                        {members.map((member) => (
                            <Pressable
                            key={member.id}
                            onPress={() => togglePaidForMember(member.id)}
                            style={[
                            styles.memberOption,
                            paidForMemberIds.includes(member.id) && styles.selectedMember,
                            ]}
                            >
                            <Text>{member.name}</Text>
                            </Pressable>
                        ))}
                        </ScrollView>
                        
                    ) : (
                        <Text style={styles.placeholderText}>No member/s available</Text>
                    )}       
                    <Text>Paid by</Text>
                    {members.length ? (
                        <ScrollView horizontal contentContainerStyle={styles.memberOptions} keyboardShouldPersistTaps="handled">
                        {members.map((member) => (
                            <Pressable
                            key={member.id}
                            onPress={() => setPaidByMemberId(member.id)}
                            style={[
                            styles.memberOption,
                            paidByMemberId === member.id && styles.selectedMember,
                            ]}
                            >
                            <Text >{member.name}</Text>
                            </Pressable>
                        ))}
                        </ScrollView>
                    ) : (
                        <Text style={styles.placeholderText}>No member/s available</Text>
                    )}

                    {validationError !== "" && (
                    <Text style={styles.errorText}>{validationError}</Text>
                    )}
                    <View style={styles.buttonRow}>
                        <Pressable
                            onPress={saveItem}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>
                                {editingItem ? "SAVE" : "ADD"}
                            </Text>
                        </Pressable> 
                        {/* <Button
                            title={editingItem ? "Save" : "Add"}
                            onPress={saveItem} 
                        /> */}
                        <Pressable
                            onPress={() => {
                                setValidationError("")
                                onClose()
                            }}
                            style={styles.button}
                        >
                            <Text style={styles.buttonText}>
                                CANCEL
                            </Text>
                        </Pressable> 
                        {/* <Button 
                            title={"Cancel"} 
                            onPress={onClose} 
                        /> */}
                    </View>
                    
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    popup: {
        width: "85%",
        padding: 24,
        borderRadius: 12,
        backgroundColor: "white",
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: "#888",
        padding: 10,
    },
    memberOptions: {
        flexDirection: "row",
        gap: 8,
    },
    memberOption: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#aaa",
        borderRadius: 8,
    },
    selectedMember: {
        backgroundColor: "#b3d38e",
    },
    placeholderText: {
        color: "#504f4f",
    },
    titleHeader: {
        fontSize: 20,
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    button: {
        margin: 5,
        padding: 10,
        width: 100,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fcbf49",
        borderRadius: 360,
    },
    buttonText: {
        color: "white",
        fontWeight: "bold"
    }
});