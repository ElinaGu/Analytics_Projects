#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sat Apr 15 17:57:20 2023

@author: yuxingu
"""

import pandas as pd

# Import data
kickstarter_df = pd.read_excel("Kickstarter.xlsx")

#Data pre-processing
#Drop rows where state is not successful or failed
df = kickstarter_df.query("state == 'successful' | state == 'failed'")


#drop rows where the subset columns are empty
df=df.dropna(subset = ['goal', 'category','static_usd_rate',
        'name_len', 'name_len_clean', 'blurb_len_clean',
        'currency','static_usd_rate',
        'created_at_yr','created_at_hr','created_at_weekday',
        'deadline_yr','deadline_day','deadline_weekday'])

#create a column to calculate the number of years a project's length
df['project_len']=df['deadline_yr'] - df['created_at_yr']

#Data-selection 'name_len_clean', 'name_len',
# Setup the variables, please see choosing rationale in report
X = df[['goal','category','static_usd_rate', 'project_len',
        'blurb_len_clean', 'name_len_clean',
        'created_at_yr','created_at_hr','created_at_weekday', 
        'deadline_yr','deadline_weekday','deadline_hr']]

#create dummy variables for X
X=pd.get_dummies(X,['created_at_weekday','deadline_weekday',#'country',
                    'category'])#'category',

#standardize X
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler() 
X_std = scaler.fit_transform(X)

#y is the successful state 
y = pd.get_dummies(df,columns = ['state'])['state_successful']
 
#split the data
from sklearn.model_selection import train_test_split
X_train,X_test,y_train,y_test = train_test_split(X_std,y,test_size=0.33,random_state=5)

#GBT without setting any hyperparameter
from sklearn.ensemble import GradientBoostingClassifier
gbt = GradientBoostingClassifier()
m = gbt.fit(X_train, y_train) 
y_test_pred = m.predict(X_test)

#accuracy score for GBT without tuning hyperparameter
from sklearn.metrics import accuracy_score
accuracy = accuracy_score(y_test, y_test_pred)
print('accuray: ',accuracy)
#0.7454700490300575
#%% tuning hyperparameter 
import numpy
from sklearn.model_selection import cross_val_score
from sklearn.ensemble import GradientBoostingClassifier

#for each of the following hyperparameter, loop through the values, 
#if the score is higher than the model without tuning hyperparameter
#set the optimal score, else, remove from model or output default
score_subsample=0
for i in range (1,10):
    model = GradientBoostingClassifier(random_state=(0),subsample=i*0.1)
    scores=cross_val_score(estimator=model, X=X_train, y=y_train, cv=5)
    if numpy.average(scores) > score_subsample:
        score_subsample = numpy.average(scores)
        optimal_subsample = i*0.1
if score_subsample < accuracy:
    optimal_subsample= 0.1
print(optimal_subsample,':',score_subsample)

score_n_estimators=0
for i in range (100,110):
    model = GradientBoostingClassifier(random_state=(0),n_estimators=i)
    scores=cross_val_score(estimator=model, X=X_train, y=y_train, cv=5)
    if numpy.average(scores) > score_n_estimators:
        score_n_estimators = numpy.average(scores)
        optimal_n_estimators = i
if score_n_estimators < accuracy:
    optimal_n_estimators= 100
print(optimal_n_estimators,':',score_n_estimators)


score_min_samples_split=0
for i in range (2,10):
    model = GradientBoostingClassifier(random_state=(0),min_samples_split=i)
    scores=cross_val_score(estimator=model, X=X_train, y=y_train, cv=5)
    if numpy.average(scores) > score_min_samples_split:
        score_min_samples_split = numpy.average(scores)
        optimal_min_samples_split = i
if score_min_samples_split < accuracy:
    optimal_min_samples_split = 2
print(optimal_min_samples_split,':',score_min_samples_split)


score_min_samples_leaf = 0 
for i in range (2,10):
    model = GradientBoostingClassifier(random_state=(0),min_samples_leaf=i)
    scores=cross_val_score(estimator=model, X=X_train, y=y_train, cv=5)
    if numpy.average(scores) > score_min_samples_leaf:
        score_min_samples_leaf = numpy.average(scores)
        optimal_min_samples_leaf = i
if score_min_samples_leaf < accuracy:
    optimal_min_samples_leaf= 1
print(optimal_min_samples_leaf,':',score_min_samples_leaf)

score_max_depth=0
for i in range (2,10):
    model = GradientBoostingClassifier(random_state=(0),max_depth=i)
    scores=cross_val_score(estimator=model, X=X_train, y=y_train, cv=5)
    if numpy.average(scores) > score_max_depth:
        score_max_depth = numpy.average(scores)
        optimal_max_depth = i
if score_max_depth < accuracy:
    optimal_max_depth= 3
print(optimal_max_depth,':',score_max_depth)



#%% GBT with hyperparameter    
from sklearn.ensemble import GradientBoostingClassifier

#based on results above
gbt = GradientBoostingClassifier(subsample=0.4,
                                 n_estimators=(100),
                                 min_samples_leaf=(1),
                                 max_depth=(4))

m_hyper = gbt.fit(X_train, y_train) 
y_test_pred = m_hyper.predict(X_test)

#print accuracy
from sklearn.metrics import accuracy_score
accuracy_score(y_test, y_test_pred)


# Print the accuracy, confusion matrix, f1 score, recall, precision
from sklearn import metrics
metrics.f1_score(y_test, y_test_pred)
metrics.confusion_matrix(y_test, y_test_pred)
print('accuracy score: ', accuracy_score(y_test, y_test_pred))


print(pd.DataFrame(metrics.confusion_matrix(y_test, y_test_pred, 
                                                labels = [0,1]), 
                       index = ['true: 0', 'true: 1'], 
                       columns = ['pred:0', 'pred: 1']))

print('\nf1 score: ', metrics.f1_score(y_test, y_test_pred))

print('precision : ', metrics.precision_score(y_test, y_test_pred))

print('recall : ', metrics.recall_score(y_test, y_test_pred))

#%% ## Grading ##

# Import Grading Data
kickstarter_grading_df = pd.read_excel("Kickstarter-Grading.xlsx")

# Pre-Process Grading Data
grading_df = kickstarter_grading_df.query("state == 'successful' | state == 'failed'")

#'name_len_clean',
grading_df=grading_df.dropna(subset = ['goal', 'category','country',
        'name_len', 'blurb_len',
        'currency','static_usd_rate',
        'created_at_yr','created_at_hr','created_at_weekday',
        'deadline_yr','deadline_day','deadline_weekday'])
grading_df['project_len']=grading_df['deadline_yr']-grading_df['created_at_yr']
# Setup the variables
X_grading = grading_df[['goal','category','static_usd_rate', 'project_len',
        'blurb_len_clean', 'name_len_clean',
        'created_at_yr','created_at_hr','created_at_weekday', 
        'deadline_yr','deadline_weekday','deadline_hr']]#,'cate']]#,'colon','cate'  


X_grading=pd.get_dummies(X_grading,['created_at_weekday','deadline_weekday',
                    'category'])

y_grading = pd.get_dummies(grading_df,columns = ['state'])['state_successful']


from sklearn.preprocessing import StandardScaler
scaler = StandardScaler() 
X_grading_std = scaler.fit_transform(X_grading) 

# Apply the model previously trained to the grading data
y_grading_pred = m_hyper.predict(X_grading_std)

# Calculate the accuracy score
print('Accuracy score: ',accuracy_score(y_grading, y_grading_pred))
print(pd.DataFrame(metrics.confusion_matrix(y_grading, y_grading_pred, 
                                                labels = [0,1]), 
                       index = ['true: 0', 'true: 1'], 
                       columns = ['pred:0', 'pred: 1']))
print('\nf1 score: ', metrics.f1_score(y_grading, y_grading_pred))

print('precision : ', metrics.precision_score(y_grading, y_grading_pred))

print('recall : ', metrics.recall_score(y_grading, y_grading_pred))
