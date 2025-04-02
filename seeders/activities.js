module.exports = {
    up: async (queryInterface, Sequelize) => {
      const now = new Date();
      
      // Create dates for activities
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
      
      const todayFormatted = today.toISOString().split('T')[0];
      const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
      const dayAfterTomorrowFormatted = dayAfterTomorrow.toISOString().split('T')[0];
      
      // Insert sample activities
      return queryInterface.bulkInsert('Activities', [
        {
          title: 'התעמלות בוקר',
          description: 'פעילות התעמלות קלה לבוקר טוב. מתאימה לכל הרמות וכוללת תרגילים לחיזוק השרירים ולשיפור הגמישות.',
          location: 'אולם התעמלות',
          date: todayFormatted,
          startTime: '09:00',
          endTime: '10:00',
          instructor: 'רונית לוי',
          maxParticipants: 20,
          equipment: 'נעלי ספורט נוחות, בקבוק מים',
          createdAt: now,
          updatedAt: now
        },
        {
          title: 'חוג אמנות',
          description: 'ציור בצבעי מים. נלמד טכניקות בסיסיות של ציור בצבעי מים ונכין יצירה משותפת.',
          location: 'חדר אמנות',
          date: todayFormatted,
          startTime: '11:00',
          endTime: '12:30',
          instructor: 'דוד כהן',
          maxParticipants: 15,
          equipment: 'הציוד יסופק במקום',
          createdAt: now,
          updatedAt: now
        },
        {
          title: 'הרצאה: בריאות ותזונה',
          description: 'הרצאה בנושא תזונה נכונה לגיל השלישי. המרצה תדבר על חשיבות התזונה לבריאות ותיתן טיפים מעשיים.',
          location: 'אולם הרצאות',
          date: tomorrowFormatted,
          startTime: '10:00',
          endTime: '11:30',
          instructor: 'ד״ר שרה לוי',
          maxParticipants: 30,
          equipment: 'מחברת ועט לרישום',
          createdAt: now,
          updatedAt: now
        },
        {
          title: 'משחקי חברה',
          description: 'אחר צהריים של משחקי חברה וקלפים. אפשרות למשחק שחמט, קלפים, רמיקוב ודומינו.',
          location: 'חדר פנאי',
          date: tomorrowFormatted,
          startTime: '16:00',
          endTime: '18:00',
          instructor: 'יוסי חיים',
          maxParticipants: 20,
          equipment: '',
          createdAt: now,
          updatedAt: now
        },
        {
          title: 'טיול לגן הבוטני',
          description: 'טיול מודרך בגן הבוטני. נכיר צמחים מיוחדים ונלמד על עולם הצומח.',
          location: 'נקודת מפגש: לובי ראשי',
          date: dayAfterTomorrowFormatted,
          startTime: '09:30',
          endTime: '12:00',
          instructor: 'רחל גרין',
          maxParticipants: 25,
          equipment: 'נעלי הליכה נוחות, כובע, בקבוק מים',
          createdAt: now,
          updatedAt: now
        }
      ]);
    },
  
    down: async (queryInterface, Sequelize) => {
      return queryInterface.bulkDelete('Activities', null, {});
    }
  };
  