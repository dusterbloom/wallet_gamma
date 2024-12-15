// Add these functions to the existing useCosmWallet hook

const exportWallet = async (authKey) => {
  try {
    const walletData = await getEncryptedWallet(username);
    if (!walletData) {
      throw new Error('No wallet found');
    }

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: walletData.iv },
      authKey,
      walletData.encrypted
    );

    const serializedWallet = new TextDecoder().decode(decryptedData);
    const wallet = await DirectSecp256k1HdWallet.deserialize(serializedWallet, "password");
    
    // Get the mnemonic (recovery phrase)
    const phrase = wallet.mnemonic;
    
    // Create QR data
    const qrData = JSON.stringify({
      type: 'cosmos-wallet-backup',
      phrase,
      timestamp: Date.now()
    });

    return { phrase, qrData };
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error('Failed to export wallet');
  }
};

const importWallet = async (phrase, authKey) => {
  try {
    // Validate mnemonic
    if (!validateMnemonic(phrase)) {
      throw new Error('Invalid recovery phrase');
    }

    // Create new wallet from phrase
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(phrase, {
      prefix: "cosmos",
    });

    const [account] = await wallet.getAccounts();
    const serialized = await wallet.serialize("password");
    
    // Encrypt the wallet data
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      authKey,
      new TextEncoder().encode(serialized)
    );

    // Store the encrypted wallet
    const walletData = {
      encrypted: new Uint8Array(encryptedData),
      iv,
      address: account.address
    };

    await storeEncryptedWallet(username, walletData);
    setAddress(account.address);

    return { success: true, address: account.address };
  } catch (error) {
    console.error('Import failed:', error);
    throw new Error('Failed to import wallet');
  }
};

// Add to the return object:
return {
  // ... existing returns ...
  exportWallet,
  importWallet,
};
