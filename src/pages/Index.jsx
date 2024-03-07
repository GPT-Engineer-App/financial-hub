import React, { useState } from "react";
import { Box, Button, Input, Flex, Text, Heading, VStack, HStack, Select, useToast, IconButton, Table, Thead, Tbody, Tr, Th, Td, Tooltip, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import { FaPlus, FaEdit, FaTrash, FaFileExport, FaFileImport } from "react-icons/fa";

const initialTransactions = [
  { id: 1, date: "2023-01-01", type: "Income", category: "Salary", amount: 5000 },
  { id: 2, date: "2023-01-05", type: "Expense", category: "Groceries", amount: -150 },
  { id: 3, date: "2023-01-10", type: "Expense", category: "Bills", amount: -300 },
];

const categories = ["Salary", "Groceries", "Bills", "Entertainment", "Other"];

const Index = () => {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [formData, setFormData] = useState({
    date: "",
    type: "Income",
    category: "Salary",
    amount: "",
  });
  const [filter, setFilter] = useState({ type: "", category: "", dateFrom: "", dateTo: "" });
  const [editingId, setEditingId] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTransaction = () => {
    if (formData.date && formData.amount) {
      setTransactions([...transactions, { ...formData, id: Date.now(), amount: Number(formData.amount) }]);
      setFormData({ date: "", type: "Income", category: "Salary", amount: "" });
      toast({
        title: "Transaction added.",
        description: "We've added your transaction.",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      toast({
        title: "Invalid Data",
        description: "Please fill out all fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleEditTransaction = (transaction) => {
    setFormData(transaction);
    setEditingId(transaction.id);
    onOpen();
  };

  const handleUpdateTransaction = () => {
    setTransactions(transactions.map((t) => (t.id === editingId ? { ...formData, id: editingId, amount: Number(formData.amount) } : t)));
    setEditingId(null);
    onClose();
    toast({
      title: "Transaction updated.",
      description: "We've updated your transaction.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleDeleteTransaction = (id) => {
    setTransactions(transactions.filter((transaction) => transaction.id !== id));
    toast({
      title: "Transaction deleted.",
      description: "We've deleted your transaction.",
      status: "warning",
      duration: 2000,
      isClosable: true,
    });
  };

  const filteredTransactions = transactions.filter((transaction) => {
    return (!filter.type || transaction.type === filter.type) && (!filter.category || transaction.category === filter.category) && (!filter.dateFrom || new Date(transaction.date) >= new Date(filter.dateFrom)) && (!filter.dateTo || new Date(transaction.date) <= new Date(filter.dateTo));
  });

  const totalBalance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const handleExportTransactions = () => {
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(transactions))}`;
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "transactions.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportTransactions = (e) => {
    const csv = e.target.value;
    const lines = csv.split("\n");
    const newTransactions = lines.map((line) => {
      const [date, type, category, amount] = line.split(",");
      return { id: Date.now(), date, type, category, amount: Number(amount) };
    });
    setTransactions([...transactions, ...newTransactions]);
  };

  const getSpendingSummary = () => {
    const summary = transactions.reduce(
      (acc, { type, amount, category }) => {
        if (type === "Income") {
          acc.income += amount;
        } else {
          acc.expenses += amount;
          acc.categories[category] = (acc.categories[category] || 0) + amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, categories: {} },
    );

    return summary;
  };

  const spendingSummary = getSpendingSummary();

  return (
    <Box p={8}>
      <Heading mb={6}>Personal Finance Manager</Heading>

      {/* Add Transaction Form */}
      <VStack spacing={4} align="stretch" mb={6}>
        <FormControl>
          <FormLabel>Date</FormLabel>
          <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Type</FormLabel>
          <Select name="type" value={formData.type} onChange={handleInputChange}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Category</FormLabel>
          <Select name="category" value={formData.category} onChange={handleInputChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Amount</FormLabel>
          <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
        </FormControl>
        <Button leftIcon={<FaPlus />} colorScheme="teal" onClick={handleAddTransaction}>
          Add Transaction
        </Button>
      </VStack>

      {/* Filter Transactions Form */}
      <VStack spacing={4} align="stretch" mb={6}>
        <FormControl>
          <FormLabel>Filter Type</FormLabel>
          <Select placeholder="Type" name="type" value={filter.type} onChange={handleFilterChange}>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Filter Category</FormLabel>
          <Select placeholder="Category" name="category" value={filter.category} onChange={handleFilterChange}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Date From</FormLabel>
          <Input type="date" name="dateFrom" value={filter.dateFrom} onChange={handleFilterChange} />
        </FormControl>
        <FormControl>
          <FormLabel>Date To</FormLabel>
          <Input type="date" name="dateTo" value={filter.dateTo} onChange={handleFilterChange} />
        </FormControl>
      </VStack>

      {/* Transactions Table */}
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Category</Th>
            <Th isNumeric>Amount</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {filteredTransactions.map((transaction) => (
            <Tr key={transaction.id}>
              <Td>{transaction.date}</Td>
              <Td>{transaction.type}</Td>
              <Td>{transaction.category}</Td>
              <Td isNumeric>{transaction.amount}</Td>
              <Td>
                <Tooltip label="Edit">
                  <IconButton icon={<FaEdit />} mr={2} onClick={() => handleEditTransaction(transaction)} />
                </Tooltip>
                <Tooltip label="Delete">
                  <IconButton icon={<FaTrash />} colorScheme="red" onClick={() => handleDeleteTransaction(transaction.id)} />
                </Tooltip>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Edit Transaction Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Date</FormLabel>
                <Input type="date" name="date" value={formData.date} onChange={handleInputChange} />
              </FormControl>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select name="category" value={formData.category} onChange={handleInputChange}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Amount</FormLabel>
                <Input type="number" name="amount" value={formData.amount} onChange={handleInputChange} />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleUpdateTransaction}>
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Total Balance */}
      <Box mt={6}>
        <Text fontSize="xl">Total Balance: {totalBalance}</Text>
      </Box>

      {/* Spending Summary */}
      <Box mt={6}>
        <Text fontSize="xl">Spending Summary:</Text>
        <Box>
          <Text>Income: {spendingSummary.income}</Text>
          <Text>Expenses: {spendingSummary.expenses}</Text>
          <Text>By Category:</Text>
          {Object.keys(spendingSummary.categories).map((category) => (
            <Text key={category}>
              {category}: {spendingSummary.categories[category]}
            </Text>
          ))}
        </Box>
      </Box>

      {/* Export & Import Transactions */}
      <Flex mt={6} justifyContent="space-between">
        <Button leftIcon={<FaFileExport />} onClick={handleExportTransactions}>
          Export Transactions
        </Button>
        <FormControl>
          <FormLabel htmlFor="import_transactions">Import Transactions (CSV)</FormLabel>
          <Textarea id="import_transactions" placeholder="Paste CSV data here..." onChange={handleImportTransactions} />
        </FormControl>
      </Flex>
    </Box>
  );
};

export default Index;
