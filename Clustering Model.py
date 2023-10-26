#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Apr  9 14:12:07 2023

@author: yuxingu
"""

import pandas as pd

# Import data
kickstarter_df = pd.read_excel("Kickstarter.xlsx")

#pre-processing
#Drop rows where state is not successful or failed
df = kickstarter_df.query("state == 'successful' | state == 'failed'")

#see the a unique list if countries for all projects
import numpy as np
countries = np.unique(df.country)

#group countries into two areas: north_america and the rest of the world 
#which includes countries in europe,oceania, and asia 
rest = ['AT', 'BE', 'CH', 'DE', 'DK', 'ES', 'FR', 'GB', 'IE', 'IT', 'LU', 
          'NL', 'NO', 'SE','AU', 'NZ','HK', 'SG']

north_america = ['CA', 'MX', 'US']


#loop through each project
location = []
for i in df.country:
    if i in rest:
        location.append('rest')
    elif i in north_america:
        location.append('north_america')
        
location = pd.Series(location)
   
#new list to group the category for each project
category = []
for i in df.category:
    if i in ['Comedy','Thrillers','Shorts','Festivals','Plays']:
        category.append('Entertainment')
    elif i in ['Academic','Makerspaces','Experimental']:
        category.append('Academic and Learning')
    elif i in ['Webseries','Flight','Robots','Wearables','Apps','Gadgets','Software','Web','Hardware']:
        category.append('Technology')
    elif i in ['Blues','Sound','Musical']:
        category.append('Music and Sound')
    elif i in ['Places','Spaces','Immersive']:
        category.append('Physical Space')

category_group=pd.Series(category)

#concat new series into the dataframe
df = pd.concat([df,location.rename('location'),category_group.rename('category_group')], axis=1)
#drop empty rows
df=df.dropna(subset = ['goal','created_at_yr','location','category_group'])

#select varibles and dummify location and category group
X = df[['goal','created_at_yr','location','category_group']]
X=pd.get_dummies(X,['location','category_group'])

#Standardize X
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler() 
X_std = scaler.fit_transform(X)

#perform DBSCAN clustering
from sklearn.cluster import DBSCAN
dbscan = DBSCAN(eps=3.2, min_samples=20) 
labels = dbscan.fit_predict(X_std)

#see the number of clusters and noise points
n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
n_noise_ = list(labels).count(-1)
print("Estimated number of clusters: %d" % n_clusters_)
print("Estimated number of noise points: %d" % n_noise_)

#add clustermembership into X
X['ClusterMembership'] = labels 

#print out the cluster size for each cluster
cluster_memberships = X['ClusterMembership']
cluster_sizes = cluster_memberships.value_counts()
cluster_sizes_df = pd.DataFrame({'Cluster': cluster_sizes.index, 'Size': cluster_sizes.values})
print(cluster_sizes_df)

#cluster results
cluster_0 = round(X[X.ClusterMembership == 0].mean())
cluster_1 = round(X[X.ClusterMembership == 1].mean())
cluster_2 = round(X[X.ClusterMembership == 2].mean())
cluster_3 = round(X[X.ClusterMembership == 3].mean())
cluster_4 = round(X[X.ClusterMembership == 4].mean())
cluster_5 = round(X[X.ClusterMembership == 5].mean())
cluster_6 = round(X[X.ClusterMembership == 6].mean())
cluster_7 = round(X[X.ClusterMembership == 7].mean())
cluster_8 = round(X[X.ClusterMembership == 8].mean())
cluster_9 = round(X[X.ClusterMembership == 9].mean())

clusters = pd.concat([cluster_0, cluster_1, cluster_2, cluster_3, cluster_4, 
                      cluster_5, cluster_6, cluster_7, cluster_8,cluster_9], axis=1)

#export into a excel file      
clusters.to_excel("Clusters_DBSCAN.xlsx")

#calculate silhouette score
from sklearn.metrics import silhouette_score
print(silhouette_score(X_std,labels))