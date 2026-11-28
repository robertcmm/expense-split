import { Text, View, StyleSheet, Pressable, ScrollView } from "react-native";
import { useState } from "react";

import { Item } from "../models/model";

import MemberDetails from "./MemberDetails";

type Member = {
  id: number;
  name: string;
  spent: string;
  paid: string;
};




type Props = {
  total: number;
  members: Member[];
  items: Item[];
  computeBalance: (member: Member) => number;
};

export default function ExpenseTotals({
  total,
  members,
  items,
  computeBalance,
}: Props) {

    const [memberDetailsVisible, setMemberDetailsVisible] = useState(false);

    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [item, setItem] = useState<Item | null>(null);

    return (
        <View style={styles.container}>
            <View style={styles.total}>
                <Text style={styles.expenseTotal}>Total: </Text>
                <Text style={styles.totalValue}>{total}</Text>
            </View>
            <View style={styles.memberDetails}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
                contentContainerStyle={styles.individualTotal}
              >
                
                {members.map((member) => {
                    if (Number(member.spent) <= 0) return null;

                    const balance = computeBalance(member);

                    return (
                    // <View key={member.id} style={styles.individualTotalDetail}>
                    <Pressable
                        key={member.id}
                        style={styles.individualTotalDetail}
                        onPress={() => {
                          setSelectedMember(member)
                          setMemberDetailsVisible(true);
                        }}
                    >
                        <Text style={styles.expenseText}>
                        {member.name}{" "}
                        {balance < 0
                            ? `is owed ${Math.abs(balance).toFixed(2)}`
                            : balance > 0
                            ? `owes ${balance.toFixed(2)}`
                            : "Settled"}
                        </Text>
                        <Text style={styles.expenseText}>
                            {member.name} paid {member.paid}
                        </Text>
                    {/* </View> */}
                    </Pressable>
                    );
                })}

              </ScrollView>
            </View>
            
            <MemberDetails
                visible={memberDetailsVisible}
                member={selectedMember}
                items={items}
                onClose={() => {
                  // setSelectedMember(null)
                  setMemberDetailsVisible(false)
                }}
                computeBalance={computeBalance}
            />
        </View>
    );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,

  },
  memberDetails: {
    paddingHorizontal: 10,
  },
  individualTotal: {
    flexDirection: "row",
    flexShrink: 0,
    gap: 8,
    paddingVertical: 10,
    
  },
  individualTotalDetail: {
    borderWidth: 2,
    borderLeftWidth: 5,
    borderBottomWidth: 3,
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    borderColor: "#fcbf49",
    backgroundColor: "#eae2b7",
    padding: 10,
    
  },
  expenseText: {
    color: "#003049",
    fontWeight: "500",
  },
  horizontalScroll: {
    width: "100%",
    flexGrow: 0,
  },
  expenseTotal: {
    color: "#eae2b7",
    fontWeight: "900",
    fontSize: 15,
    
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    // borderWidth: 3,
    // borderStyle: "dashed",
    // borderRadius: 18,
    // borderColor: "#eae2b7",
    // backgroundColor: "#fcbf49",
  },
  totalValue: {
    color: "#d62828",
    fontSize: 20,
    fontWeight: "bold",
  }
});