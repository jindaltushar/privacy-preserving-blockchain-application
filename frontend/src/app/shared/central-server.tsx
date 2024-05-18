'use client';
import { CENTRAL_SERVER_URL } from '@/contracts/constants';

export async function GetMatchingQuestions(
  questionString: string,
  questionType?: number | null,
) {
  try {
    if (questionType === null) {
      questionType = 999;
    }
    console.log('from cnetralserver questionType:', questionType);
    const response = await fetch(CENTRAL_SERVER_URL + '/questionMatch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        questionString: questionString,
        questionType: questionType,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Matching Questions:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function GetSurveyAnswerStats(surveyId: string) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/getSurveyAnswerHistory',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secretSurveyId: surveyId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Survey Answer Stats:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function getPostsForUser(
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/getPostsForUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Posts:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function getPostsForOrganisation(organisationId: number) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/getPostsForOrganisation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organisationId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Posts:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function increaseLikes(
  postId: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/increaseLikes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return true; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function decreaseLikes(
  postId: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/decreaseLikes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        postId,
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return true; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function addFollowing(
  followUser: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/addFollowing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        followUser,
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return true; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function removeFollowing(
  followUser: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/removeFollowing', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        followUser,
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    return true; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function getUsersFollowings(
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/getUsersFollowings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
        time,
        r,
        s,
        v,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Posts:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function getOrganisationFollowers(orgId: number) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/getOrganisationFollowers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    console.log('Posts:', data);
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function isUserFollowingThisOrganisation(
  orgId: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/isUserFollowingThisOrganisation',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId,
          user,
          time,
          r,
          s,
          v,
        }),
      },
    );

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function requestCivicVerification(
  userId: number,
  user: string,
  time: number,
  r: string,
  s: string,
  v: number,
) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/requestCivicVerification',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          user,
          time,
          r,
          s,
          v,
        }),
      },
    );
    return true;
  } catch (error) {
    console.error('Error:', error);
    throw error; // Re-throw the error for the caller to handle
  }
}

export async function reportSuccessfulRewards(blockNumber: number) {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/reportSuccessfulRewards',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blockNumber,
        }),
      },
    );
    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function getMyRewardsTotal(user: string) {
  try {
    const response = await fetch(CENTRAL_SERVER_URL + '/getMyRewardsTotal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user,
      }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}

export async function getTotalValueTransactedOnPlatform() {
  try {
    const response = await fetch(
      CENTRAL_SERVER_URL + '/getTotalValueTransactedOnPlatform',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
