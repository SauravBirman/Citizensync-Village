import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, serverTimestamp, deleteDoc, Timestamp } from 'firebase/firestore';

export const authenticateUser = async (aadhaar, role) => {
  if (!/^\d{12}$/.test(aadhaar)) {
    throw new Error('Invalid Aadhaar: Must be a 12-digit number');
  }
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('aadhaar', '==', aadhaar));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;
    const user = snapshot.docs[0].data();
    if (user.role !== role) throw new Error('Role mismatch');
    return { id: snapshot.docs[0].id, ...user };
  } catch (err) {
    throw new Error(`Authentication failed: ${err.message}`);
  }
};

export const getProfile = async (aadhaar) => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('aadhaar', '==', aadhaar));
    const snapshot = await getDocs(q);
    return snapshot.empty ? null : { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
  } catch (err) {
    throw new Error(`Profile fetch failed: ${err.message}`);
  }
};

export const saveProfile = async (profile) => {
  const { aadhaar, role, selectedVillage } = profile;
  if (!/^\d{12}$/.test(aadhaar)) {
    throw new Error('Invalid Aadhaar: Must be a 12-digit number');
  }
  try {
    if (role === 'Sarpanch') {
      const sarpanchQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Sarpanch'),
        where('selectedVillage', '==', selectedVillage)
      );
      const sarpanchSnapshot = await getDocs(sarpanchQuery);
      if (!sarpanchSnapshot.empty) {
        throw new Error('This village already has a Sarpanch');
      }
    }

    if (role === 'Tehsil Officer') {
      const tehsilOfficerQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Tehsil Officer')
      );
      const tehsilOfficerSnapshot = await getDocs(tehsilOfficerQuery);
      if (!tehsilOfficerSnapshot.empty) {
        throw new Error('A Tehsil Officer already exists for the entire region');
      }
    }

    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('aadhaar', '==', aadhaar));
    const snapshot = await getDocs(q);

    const profileData = {
      aadhaar,
      role,
      selectedVillage,
      name: profile.name,
      mobile: profile.mobile,
      email: profile.email || '',
      address: profile.address,
    };

    if (snapshot.empty) {
      await addDoc(collection(db, 'users'), profileData);
      return profileData;
    } else {
      throw new Error('Profile already exists');
    }
  } catch (err) {
    throw new Error(`Profile save failed: ${err.message}`);
  }
};

export const submitIssue = async (issue) => {
  try {
    const { description, location, village, status, priority, address, reportedBy } = issue;
    const issueRef = await addDoc(collection(db, 'issues'), {
      description,
      village,
      status,
      priority,
      address: address || '',
      lat: location?.lat || null,
      lng: location?.lng || null,
      reportedBy,
      urgentVotes: 0,
      notUrgentVotes: 0,
      registeredAt: serverTimestamp(),
      escalatedTo: null,
    });
    await addDoc(collection(db, 'notifications'), {
      userAadhaar: reportedBy.aadhaar,
      issueId: issueRef.id,
      message: `Your issue "${description}" has been reported.`,
      timestamp: serverTimestamp(),
      read: false,
    });
  } catch (err) {
    throw new Error(`Issue submission failed: ${err.message}`);
  }
};

export const getIssues = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'issues'));
    let issues = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    for (let i = 0; i < issues.length; i++) {
      const issue = issues[i];
      
      if (issue.status === 'Open' && issue.escalatedTo === null && issue.registeredAt) {
        const registeredAt = issue.registeredAt.toDate();
        const now = new Date();
        const daysDiff = (now - registeredAt) / (1000 * 60 * 60 * 24);

        if (daysDiff >= 5) {
          const issueRef = doc(db, 'issues', issue.id);
          await updateDoc(issueRef, { escalatedTo: 'Tehsil Officer' });

          const tehsilOfficerQuery = query(
            collection(db, 'users'),
            where('role', '==', 'Tehsil Officer')
          );
          const tehsilOfficerSnapshot = await getDocs(tehsilOfficerQuery);
          if (!tehsilOfficerSnapshot.empty) {
            const tehsilOfficer = tehsilOfficerSnapshot.docs[0].data();
            await addDoc(collection(db, 'notifications'), {
              userAadhaar: tehsilOfficer.aadhaar,
              issueId: issue.id,
              message: `Issue "${issue.description}" in ${issue.village} has been escalated to you due to Sarpanch inaction.`,
              timestamp: serverTimestamp(),
              read: false,
            });
          }

          issue.escalatedTo = 'Tehsil Officer';
        }
      }

      if (issue.status === 'Solved' && issue.satisfactionEvaluationDue) {
        const now = new Date();
        const evaluationDue = issue.satisfactionEvaluationDue.toDate();

        if (now >= evaluationDue) {
          const satisfiedVotes = issue.satisfiedVotes || 0;
          const unsatisfiedVotes = issue.unsatisfiedVotes || 0;

          if (unsatisfiedVotes >= satisfiedVotes) {
            const sarpanchQuery = query(
              collection(db, 'users'),
              where('role', '==', 'Sarpanch'),
              where('selectedVillage', '==', issue.village)
            );
            const sarpanchSnapshot = await getDocs(sarpanchQuery);
            if (!sarpanchSnapshot.empty) {
              const sarpanch = sarpanchSnapshot.docs[0].data();
              await addDoc(collection(db, 'notifications'), {
                userAadhaar: sarpanch.aadhaar,
                issueId: issue.id,
                message: `After 2 days, issue "${issue.description}" in ${issue.village} has ${unsatisfiedVotes} unsatisfied votes, which is greater than or equal to ${satisfiedVotes} satisfied votes.`,
                timestamp: serverTimestamp(),
                read: false,
              });
            }
            const issueRef = doc(db, 'issues', issue.id);
            await updateDoc(issueRef, { satisfactionEvaluationDue: null });
            issue.satisfactionEvaluationDue = null;
          } else {
            await deleteIssue(issue.id);
            issues.splice(i, 1);
            i--;
          }
        }
      }
    }

    return issues;
  } catch (err) {
    throw new Error(`Issues fetch failed: ${err.message}`);
  }
};

export const deleteIssue = async (issueId) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    await deleteDoc(issueRef);
  } catch (err) {
    throw new Error(`Issue deletion failed: ${err.message}`);
  }
};

export const voteIssue = async (issueId, voteType, userAadhaar) => {
  try {
    const votesRef = collection(db, 'issues', issueId, 'votes');
    const q = query(votesRef, where('userAadhaar', '==', userAadhaar));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('User has already voted');
    }
    await addDoc(votesRef, { userAadhaar, voteType });
    const issueRef = doc(db, 'issues', issueId);
    const issueSnapshot = await getDocs(query(collection(db, 'issues'), where('__name__', '==', issueId)));
    if (!issueSnapshot.empty) {
      const issue = issueSnapshot.docs[0].data();
      await updateDoc(issueRef, {
        urgentVotes: voteType === 'urgent' ? (issue.urgentVotes || 0) + 1 : issue.urgentVotes || 0,
        notUrgentVotes: voteType === 'notUrgent' ? (issue.notUrgentVotes || 0) + 1 : issue.notUrgentVotes || 0,
      });
    }
  } catch (err) {
    throw new Error(`Vote failed: ${err.message}`);
  }
};

export const hasVoted = async (issueId, userAadhaar) => {
  try {
    const votesRef = collection(db, 'issues', issueId, 'votes');
    const q = query(votesRef, where('userAadhaar', '==', userAadhaar));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    throw new Error(`Vote check failed: ${err.message}`);
  }
};

export const voteSatisfaction = async (issueId, voteType, userAadhaar, village, description) => {
  try {
    const votesRef = collection(db, 'issues', issueId, 'satisfaction_votes');
    const q = query(votesRef, where('userAadhaar', '==', userAadhaar));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      throw new Error('User has already voted on satisfaction');
    }
    await addDoc(votesRef, { userAadhaar, voteType });

    const issueRef = doc(db, 'issues', issueId);
    const issueSnapshot = await getDocs(query(collection(db, 'issues'), where('__name__', '==', issueId)));
    if (!issueSnapshot.empty) {
      const issue = issueSnapshot.docs[0].data();
      const newSatisfiedVotes = voteType === 'satisfied' ? (issue.satisfiedVotes || 0) + 1 : (issue.satisfiedVotes || 0);
      const newUnsatisfiedVotes = voteType === 'unsatisfied' ? (issue.unsatisfiedVotes || 0) + 1 : (issue.unsatisfiedVotes || 0);
      
      await updateDoc(issueRef, {
        satisfiedVotes: newSatisfiedVotes,
        unsatisfiedVotes: newUnsatisfiedVotes,
      });

      if (newUnsatisfiedVotes > newSatisfiedVotes) {
        const sarpanchQuery = query(
          collection(db, 'users'),
          where('role', '==', 'Sarpanch'),
          where('selectedVillage', '==', village)
        );
        const sarpanchSnapshot = await getDocs(sarpanchQuery);
        if (!sarpanchSnapshot.empty) {
          const sarpanch = sarpanchSnapshot.docs[0].data();
          await addDoc(collection(db, 'notifications'), {
            userAadhaar: sarpanch.aadhaar,
            issueId,
            message: `Issue "${description}" in ${village} has more unsatisfied votes (${newUnsatisfiedVotes}) than satisfied votes (${newSatisfiedVotes}).`,
            timestamp: serverTimestamp(),
            read: false,
          });
        }
      }
    }
  } catch (err) {
    throw new Error(`Satisfaction vote failed: ${err.message}`);
  }
};

export const hasVotedSatisfaction = async (issueId, userAadhaar) => {
  try {
    const votesRef = collection(db, 'issues', issueId, 'satisfaction_votes');
    const q = query(votesRef, where('userAadhaar', '==', userAadhaar));
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (err) {
    throw new Error(`Satisfaction vote check failed: ${err.message}`);
  }
};

export const resolveIssue = async (issueId, reportedByAadhaar, description) => {
  try {
    const issueRef = doc(db, 'issues', issueId);
    const solvedAt = Timestamp.now();
    const satisfactionEvaluationDue = Timestamp.fromDate(new Date(solvedAt.toDate().getTime() + 2 * 24 * 60 * 60 * 1000));
    await updateDoc(issueRef, { 
      status: 'Solved',
      solvedAt,
      satisfiedVotes: 0,
      unsatisfiedVotes: 0,
      satisfactionEvaluationDue
    });
    await addDoc(collection(db, 'notifications'), {
      userAadhaar: reportedByAadhaar,
      issueId,
      message: `Issue "${description}" has been marked as Solved.`,
      timestamp: serverTimestamp(),
      read: false,
    });
  } catch (err) {
    throw new Error(`Failed to mark issue as solved: ${err.message}`);
  }
};

export const addComment = async (issueId, comment) => {
  try {
    await addDoc(collection(db, 'issues', issueId, 'comments'), {
      ...comment,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    throw new Error(`Comment submission failed: ${err.message}`);
  }
};

export const getComments = async (issueId) => {
  try {
    const snapshot = await getDocs(collection(db, 'issues', issueId, 'comments'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error(`Comments fetch failed: ${err.message}`);
  }
};

export const postAnnouncement = async (announcement) => {
  try {
    await addDoc(collection(db, 'announcements'), {
      ...announcement,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    throw new Error(`Announcement submission failed: ${err.message}`);
  }
};

export const getAnnouncements = async (village) => {
  try {
    const q = query(collection(db, 'announcements'), where('village', '==', village));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error(`Announcements fetch failed: ${err.message}`);
  }
};

export const getNotifications = async (userAadhaar) => {
  try {
    const q = query(collection(db, 'notifications'), where('userAadhaar', '==', userAadhaar));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error(`Notifications fetch failed: ${err.message}`);
  }
};

export const markNotificationRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (err) {
    throw new Error(`Failed to mark notification as read: ${err.message}`);
  }
};

export const getIssueAnalytics = async (village) => {
  try {
    const issues = await getIssues();
    const villageIssues = issues.filter((issue) => issue.village === village);
    const openCount = villageIssues.filter((issue) => issue.status === 'Open').length;
    const solvedCount = villageIssues.filter((issue) => issue.status === 'Solved').length;
    const topVoted = await Promise.all(
      villageIssues
        .filter((issue) => issue.status === 'Open')
        .sort((a, b) => (b.urgentVotes || 0) - (a.urgentVotes || 0))
        .slice(0, 3)
        .map(async (issue) => {
          const comments = await getComments(issue.id);
          return { ...issue, commentCount: comments.length };
        })
    );
    return { openCount, solvedCount, topVoted };
  } catch (err) {
    throw new Error(`Analytics fetch failed: ${err.message}`);
  }
};

export const prioritizeIssue = (description) => {
  const urgentKeywords = ['urgent', 'hazard', 'emergency', 'water'];
  return urgentKeywords.some((keyword) => description.toLowerCase().includes(keyword))
    ? 'High'
    : 'Normal';
};

export const getVillages = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'villages'));
    return snapshot.empty ? ['Village A', 'Village B', 'Village C', 'Village D'] : snapshot.docs.map((doc) => doc.data().name);
  } catch (err) {
    if (err.message.includes('Missing or insufficient permissions')) {
      return ['Village A', 'Village B', 'Village C', 'Village D'];
    }
    throw new Error(`Villages fetch failed: ${err.message}`);
  }
};