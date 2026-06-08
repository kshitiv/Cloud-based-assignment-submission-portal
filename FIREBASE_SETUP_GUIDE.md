# Firebase Collection Setup - Separate Assignment & Quiz Submissions

## Overview
The code has been updated to store **assignment submissions** and **quiz submissions** in **separate Firebase collections** for better organization and easier management.

---

## Firebase Collections Structure

### Before (Old Structure)
```
submissions/
├── {document} (both assignments and quizzes mixed)
│   ├── assignmentId: "..."
│   ├── quizId: "..."
│   ├── studentId: "..."
│   └── ...
```

### After (New Structure)
```
assignment_submissions/
├── {document} (only assignments)
│   ├── assignmentId: "..."
│   ├── studentId: "..."
│   ├── answer: "..."
│   ├── fileData: "..."
│   ├── fileName: "..."
│   ├── fileType: "..."
│   ├── submittedAt: timestamp
│   ├── marks: null/number
│   ├── feedback: "..."
│   └── ...

quiz_submissions/
├── {document} (only quizzes)
│   ├── quizId: "..."
│   ├── studentId: "..."
│   ├── answers: [...]
│   ├── marks: number
│   ├── maxMarks: number
│   ├── feedback: "..."
│   ├── submittedAt: timestamp
│   ├── autoGraded: boolean
│   └── ...
```

---

## What Changed in Code

### 1. **Student Dashboard (student.html)**
- **Assignment Submission**: Now stores in `assignment_submissions` collection
- **Quiz Submission**: Now stores in `quiz_submissions` collection
- **Data Loading**: Fetches from both collections separately and combines them for display

### 2. **Faculty Dashboard (faculty.html)**
- **Data Fetching**: Loads submissions from both `assignment_submissions` and `quiz_submissions`
- **Grading**: Determines which collection to update based on submission type
- **Overview**: Displays statistics from both collections
- **Submissions Management**: Works with both collection types seamlessly

---

## How to Set Up in Firebase Firestore

### Option 1: Manual Migration (Recommended)
1. Go to your **Firebase Console** → **Firestore Database**
2. **Create two new collections** (if they don't exist):
   - `assignment_submissions`
   - `quiz_submissions`
3. **Migrate existing data** from `submissions` collection:
   - Documents with `assignmentId` → Move to `assignment_submissions`
   - Documents with `quizId` → Move to `quiz_submissions`
4. Keep the old `submissions` collection as backup before deleting
5. Once verified everything works, delete the old `submissions` collection

### Option 2: Automated Migration (Using Firebase Cloud Functions)
Use this Cloud Function to migrate existing submissions:

```javascript
// Deploy this as a Cloud Function in Firebase Console
const functions = require('firebase-functions');
const admin = require('firebase-admin');

exports.migrateSubmissions = functions.https.onCall(async (data, context) => {
  // Only allow admin/authenticated users
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
  
  const db = admin.firestore();
  const snapshot = await db.collection('submissions').get();
  
  let assignCount = 0, quizCount = 0;
  
  for (const doc of snapshot.docs) {
    const subData = doc.data();
    try {
      if (subData.assignmentId) {
        await db.collection('assignment_submissions').doc(doc.id).set(subData);
        assignCount++;
      } else if (subData.quizId) {
        await db.collection('quiz_submissions').doc(doc.id).set(subData);
        quizCount++;
      }
    } catch (err) {
      console.error(`Error migrating ${doc.id}:`, err);
    }
  }
  
  return {
    message: 'Migration completed',
    assignmentsCount: assignCount,
    quizzesCount: quizCount
  };
});
```

---

## Testing the Changes

### Student Side:
1. Submit an **assignment** → Check it appears in `assignment_submissions` collection
2. Submit a **quiz** → Check it appears in `quiz_submissions` collection
3. View "My Results" → Both assignments and quizzes should appear

### Faculty Side:
1. View **Submissions** → Should show both assignment and quiz submissions
2. Filter by assignment → Should show only that assignment's submissions
3. Grade a submission → Should update the correct collection

---

## Firebase Rules (Security Rules)

Add these Firestore security rules to control access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Assignment Submissions
    match /assignment_submissions/{docId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow update: if request.auth.uid == resource.data.studentId || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'faculty';
    }
    
    // Quiz Submissions
    match /quiz_submissions/{docId} {
      allow read, write: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.studentId;
      allow update: if request.auth.uid == resource.data.studentId || 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'faculty';
    }
    
    // Keep existing rules for other collections (assignments, quizzes, users, etc.)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## Benefits of This Change

✅ **Better Organization**: Assignments and quizzes are now clearly separated  
✅ **Easier Downloads**: Faculty can easily download all assignment submissions OR all quiz submissions  
✅ **Improved Performance**: Smaller collections = faster queries  
✅ **Cleaner Database**: No mixing of different submission types  
✅ **Future Scalability**: Easy to add filters, reports, and analytics per type  

---

## Backward Compatibility

Once you verify the new structure works correctly:
1. Archive or backup the old `submissions` collection
2. Delete it to keep the database clean
3. All new submissions will automatically go to the appropriate collection

---

## Troubleshooting

**Issue**: Old submissions not visible after migration  
**Solution**: Ensure all documents are correctly moved to the new collections

**Issue**: Grading doesn't work  
**Solution**: Check browser console for errors; ensure the submission `type` field is set correctly

**Issue**: Permission denied errors  
**Solution**: Update your Firestore security rules (see above)

---

## Questions?
If you encounter any issues, check:
1. Browser Console (F12) for JavaScript errors
2. Firebase Console → Firestore → Collections to verify data structure
3. Firebase Console → Firestore → Rules to ensure permissions are correct
