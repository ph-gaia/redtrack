# Regras do Firestore - Configuração Correta

## Problema
As regras atuais só permitem acesso à coleção `users`, mas agora estamos usando:
- `redtrack_api_key` - para armazenar a API key
- `siteStatus` - para armazenar os status dos sites

## Regras Corretas

Substitua as regras atuais pelas seguintes:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras para a API key
    match /redtrack_api_key/{userId} {
      allow read, write: if true; // Para desenvolvimento
    }
    
    // Regras para os status dos sites
    match /siteStatus/{docId} {
      allow read, write: if true; // Para desenvolvimento
    }
    
    // Manter regras antigas para compatibilidade (opcional)
    match /users/{userId} {
      allow read, write: if true; // Para desenvolvimento
    }
  }
}
```

## Estrutura dos Documentos

### redtrack_api_key
```
redtrack_api_key/
  default-user/
    apiKey: "sua_api_key_aqui"
```

### siteStatus
```
siteStatus/
  default-user_YI3UQsmhPh2TTMrpX1b9/
    status: {
      "6817d82490ac166a2df40d99": {
        "1464220": 0,
        "1465992": 0,
        "1552068": 0
      },
      "680ec4a62d46710200b062b8": {
        "1018671": 0,
        "1158747": 0
      }
    }
```

## Passos para Aplicar

1. Vá para [Firebase Console](https://console.firebase.google.com/)
2. Selecione o projeto `redtrack-9a37c`
3. Clique em **Firestore Database** > **Rules**
4. Cole as regras acima
5. Clique em **Publish**

## Regras de Produção (Opcional)

Para produção, use regras mais seguras:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /redtrack_api_key/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /siteStatus/{docId} {
      allow read, write: if request.auth != null && docId.matches(request.auth.uid + '_.*');
    }
  }
}
``` 